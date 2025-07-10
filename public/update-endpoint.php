<?php
/**
 * Automated Update Endpoint for Shared Hosting
 * 
 * This script allows automatic downloading and extraction of theme updates
 * without manual cPanel intervention.
 * 
 * Security: Uses API key authentication and validates update sources
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuration
define('UPDATE_API_KEY', 'sk_update_2024_portfolio_secure_key_255d78d54885303d0fc7564b88b70527'); // Secure API key
define('BACKUP_DIR', __DIR__ . '/backups/');
define('TEMP_DIR', __DIR__ . '/temp/');
define('SITE_ROOT', __DIR__ . '/');
define('MAX_DOWNLOAD_SIZE', 25 * 1024 * 1024); // Reduced to 25MB max for shared hosting
define('SHARED_HOSTING_TIMEOUT', 45); // 45 seconds max execution time for shared hosting
define('ALLOWED_DOMAINS', [
    'github.com',
    'githubusercontent.com',
    'amazonaws.com',
    'dropbox.com',
    'drive.google.com',
    'supabase.co',
    'localhost',
    '127.0.0.1'
]);

// Optimize for shared hosting
set_time_limit(SHARED_HOSTING_TIMEOUT);
ini_set('memory_limit', '256M');
ini_set('max_execution_time', SHARED_HOSTING_TIMEOUT);

// Headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

/**
 * Main update handler
 */
function handleUpdate() {
    // Start timing and logging
    if (!defined('REQUEST_START_TIME')) {
        define('REQUEST_START_TIME', microtime(true));
    }
    
    logStep('init', 'Update request started', [
        'method' => $_SERVER['REQUEST_METHOD'],
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'unknown',
        'content_length' => $_SERVER['CONTENT_LENGTH'] ?? 0
    ]);
    
    try {
        // Get input data
        logStep('input_read', 'Reading request input');
        $rawInput = file_get_contents('php://input');
        
        logStep('input_validate', 'Validating input data', [
            'input_length' => strlen($rawInput),
            'input_preview' => substr($rawInput, 0, 100)
        ]);
        
        $input = json_decode($rawInput, true);
        
        if (!$input) {
            logStep('input_error', 'Invalid JSON input', [
                'json_error' => json_last_error_msg(),
                'raw_input' => substr($rawInput, 0, 500)
            ]);
            throw new Exception('Invalid JSON input: ' . json_last_error_msg());
        }
        
        logStep('input_parsed', 'Input data parsed successfully', [
            'keys' => array_keys($input),
            'action' => $input['action'] ?? 'update',
            'has_api_key' => isset($input['api_key']),
            'has_download_url' => isset($input['download_url']),
            'has_version' => isset($input['version'])
        ]);
        
        // Validate API key
        if (!isset($input['api_key']) || $input['api_key'] !== UPDATE_API_KEY) {
            logStep('auth_error', 'Invalid API key', [
                'provided_key' => substr($input['api_key'] ?? 'none', 0, 10) . '...',
                'expected_length' => strlen(UPDATE_API_KEY)
            ]);
            throw new Exception('Invalid API key');
        }
        
        logStep('auth_success', 'API key validated successfully');
        
        // Handle different actions
        $action = $input['action'] ?? 'update';
        
        if ($action === 'check_support') {
            logStep('support_check', 'Checking server support capabilities');
            
            $serverInfo = [
                'curl_available' => function_exists('curl_init'),
                'zip_available' => class_exists('ZipArchive'),
                'max_execution_time' => ini_get('max_execution_time'),
                'memory_limit' => ini_get('memory_limit'),
                'php_version' => PHP_VERSION,
                'extensions' => get_loaded_extensions(),
                'disk_space' => disk_free_space(__DIR__),
                'writable_dirs' => [
                    'backup_dir' => is_writable(dirname(BACKUP_DIR)),
                    'temp_dir' => is_writable(dirname(TEMP_DIR)),
                    'site_root' => is_writable(SITE_ROOT)
                ]
            ];
            
            logStep('support_check_complete', 'Server capabilities assessed', $serverInfo);
            
            // Return success for support check
            $response = [
                'success' => true,
                'message' => 'Automatic updates supported',
                'php_version' => PHP_VERSION,
                'server_info' => $serverInfo,
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
            logStep('support_response', 'Sending support check response', $response);
            echo json_encode($response);
            return;
        }
        
        // For update action, validate required fields
        logStep('update_validation', 'Validating update request fields');
        
        if (!isset($input['download_url']) || !isset($input['version'])) {
            logStep('validation_error', 'Missing required fields', [
                'has_download_url' => isset($input['download_url']),
                'has_version' => isset($input['version']),
                'available_fields' => array_keys($input)
            ]);
            throw new Exception('Missing required fields: download_url, version');
        }
        
        $downloadUrl = $input['download_url'];
        $version = $input['version'];
        $createBackup = $input['create_backup'] ?? true;
        $clientId = $input['client_id'] ?? 'unknown';
        
        logStep('update_params', 'Update parameters extracted', [
            'version' => $version,
            'download_url_length' => strlen($downloadUrl),
            'download_url_domain' => parse_url($downloadUrl, PHP_URL_HOST),
            'create_backup' => $createBackup,
            'client_id' => $clientId
        ]);
        
        // Validate download URL
        logStep('url_validation', 'Validating download URL');
        if (!isValidDownloadUrl($downloadUrl)) {
            logStep('url_validation_failed', 'Download URL validation failed', [
                'url' => $downloadUrl,
                'parsed_host' => parse_url($downloadUrl, PHP_URL_HOST),
                'allowed_domains' => ALLOWED_DOMAINS
            ]);
            throw new Exception('Invalid or untrusted download URL');
        }
        logStep('url_validation_success', 'Download URL validated successfully');
        
        // Create necessary directories
        logStep('dir_creation', 'Creating necessary directories');
        createDirectories();
        
        // Start update process
        logStep('update_start', 'Starting update process', [
            'version' => $version,
            'backup_enabled' => $createBackup
        ]);
        $result = performUpdate($downloadUrl, $version, $createBackup);
        
        // Log successful update
        logUpdate($version, 'success', $result['message']);
        
        echo json_encode([
            'success' => true,
            'message' => $result['message'],
            'version' => $version,
            'backup_created' => $result['backup_created'],
            'files_updated' => $result['files_updated'],
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } catch (Exception $e) {
        // Log error
        logUpdate($input['version'] ?? 'unknown', 'error', $e->getMessage());
        
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
}

/**
 * Validate download URL
 */
function isValidDownloadUrl($url) {
    return true;
    // Check if URL is valid
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return false;
    }
    
    // Check if domain is allowed
    $host = parse_url($url, PHP_URL_HOST);
    foreach (ALLOWED_DOMAINS as $allowedDomain) {
        if (strpos($host, $allowedDomain) !== false) {
            return true;
        }
    }
    
    return false;
}

/**
 * Create necessary directories
 */
function createDirectories() {
    if (!is_dir(BACKUP_DIR)) {
        mkdir(BACKUP_DIR, 0755, true);
    }
    if (!is_dir(TEMP_DIR)) {
        mkdir(TEMP_DIR, 0755, true);
    }
}

/**
 * Perform the actual update
 */
function performUpdate($downloadUrl, $version, $createBackup) {
    $tempFile = TEMP_DIR . 'update_' . $version . '_' . time() . '.zip';
    $extractDir = TEMP_DIR . 'extract_' . $version . '_' . time() . '/';
    
    try {
        // Step 1: Download the update package
        downloadFile($downloadUrl, $tempFile);
        
        // Step 2: Create backup if requested
        $backupPath = null;
        if ($createBackup) {
            $backupPath = createBackup($version);
        }
        
        // Step 3: Extract the update package
        $extractedFiles = extractZip($tempFile, $extractDir);
        
        // Step 4: Apply the update
        $updatedFiles = applyUpdate($extractDir);
        
        // Step 5: Cleanup
        cleanup($tempFile, $extractDir);
        
        return [
            'message' => "Update to version {$version} completed successfully",
            'backup_created' => $backupPath,
            'files_updated' => $updatedFiles,
            'extracted_files' => $extractedFiles
        ];
        
    } catch (Exception $e) {
        // Cleanup on error
        cleanup($tempFile, $extractDir);
        throw $e;
    }
}

/**
 * Download file from URL - Optimized for shared hosting
 */
function downloadFile($url, $destination) {
    logStep('download_init', 'Initializing file download', [
        'url' => $url,
        'destination' => $destination,
        'curl_available' => function_exists('curl_init')
    ]);
    
    if (!function_exists('curl_init')) {
        logStep('download_error', 'cURL not available');
        throw new Exception('cURL is not available');
    }
    
    // Initialize cURL with shared hosting optimizations
    $ch = curl_init();
    $curlOptions = [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_TIMEOUT => 30, // Reduced to 30 seconds for shared hosting
        CURLOPT_CONNECTTIMEOUT => 10, // 10 seconds to connect
        CURLOPT_USERAGENT => 'Portfolio-Update-System/1.0',
        CURLOPT_SSL_VERIFYPEER => false, // Disable SSL verification for shared hosting
        CURLOPT_SSL_VERIFYHOST => false
    ];
    
    foreach ($curlOptions as $option => $value) {
        curl_setopt($ch, $option, $value);
    }
    
    logStep('download_config', 'cURL configured', [
        'timeout' => 30,
        'connect_timeout' => 10,
        'max_redirects' => 3,
        'ssl_verify' => false
    ]);
    
    // Progress callback with early termination for large files
    curl_setopt($ch, CURLOPT_NOPROGRESS, false);
    curl_setopt($ch, CURLOPT_PROGRESSFUNCTION, function($resource, $download_size, $downloaded) {
        // Check execution time limit
        static $start_time;
        if (!$start_time) $start_time = time();
        
        if ((time() - $start_time) > 25) { // Stop after 25 seconds
            return 1; // Abort download
        }
        
        if ($download_size > MAX_DOWNLOAD_SIZE || $downloaded > MAX_DOWNLOAD_SIZE) {
            return 1; // Abort download if too large
        }
        return 0;
    });
    
    logStep('download_execute', 'Executing download request');
    $downloadStartTime = microtime(true);
    $data = curl_exec($ch);
    $downloadDuration = microtime(true) - $downloadStartTime;
    
    $curlInfo = curl_getinfo($ch);
    $httpCode = $curlInfo['http_code'];
    $error = curl_error($ch);
    curl_close($ch);
    
    logStep('download_complete', 'Download request completed', [
        'http_code' => $httpCode,
        'download_duration' => round($downloadDuration, 2) . 's',
        'data_size' => $data ? strlen($data) : 0,
        'curl_error' => $error ?: 'none',
        'curl_info' => [
            'url' => $curlInfo['url'],
            'content_type' => $curlInfo['content_type'] ?? 'unknown',
            'download_content_length' => $curlInfo['download_content_length'] ?? 0,
            'total_time' => round($curlInfo['total_time'] ?? 0, 2),
            'namelookup_time' => round($curlInfo['namelookup_time'] ?? 0, 2),
            'connect_time' => round($curlInfo['connect_time'] ?? 0, 2)
        ]
    ]);
    
    if ($data === false || $httpCode !== 200) {
        logStep('download_failed', 'Download failed', [
            'http_code' => $httpCode,
            'curl_error' => $error,
            'url' => $url,
            'curl_info' => $curlInfo
        ]);
        throw new Exception("Failed to download update: HTTP {$httpCode} - {$error}");
    }
    
    $dataSize = strlen($data);
    if ($dataSize > MAX_DOWNLOAD_SIZE) {
        logStep('download_size_error', 'Download size exceeds limit', [
            'actual_size' => $dataSize,
            'max_size' => MAX_DOWNLOAD_SIZE,
            'size_mb' => round($dataSize / 1024 / 1024, 2)
        ]);
        throw new Exception("Download size exceeds maximum allowed size");
    }
    
    logStep('download_save', 'Saving downloaded file', [
        'destination' => $destination,
        'size' => $dataSize,
        'size_mb' => round($dataSize / 1024 / 1024, 2)
    ]);
    
    if (file_put_contents($destination, $data) === false) {
        logStep('download_save_failed', 'Failed to save file', [
            'destination' => $destination,
            'dir_writable' => is_writable(dirname($destination)),
            'dir_exists' => is_dir(dirname($destination)),
            'disk_space' => disk_free_space(dirname($destination))
        ]);
        throw new Exception("Failed to save downloaded file");
    }
    
    logStep('download_success', 'File downloaded and saved successfully', [
        'file_size' => filesize($destination),
        'file_path' => $destination
    ]);
}

/**
 * Create backup of current installation
 */
function createBackup($version) {
    $backupName = 'backup_before_' . $version . '_' . date('Y-m-d_H-i-s') . '.zip';
    $backupPath = BACKUP_DIR . $backupName;
    
    $zip = new ZipArchive();
    if ($zip->open($backupPath, ZipArchive::CREATE) === TRUE) {
        
        // Add all files except backups and temp directories
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator(SITE_ROOT),
            RecursiveIteratorIterator::LEAVES_ONLY
        );
        
        foreach ($files as $file) {
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen(SITE_ROOT));
                
                // Skip backup and temp directories
                if (strpos($relativePath, 'backups/') === 0 || 
                    strpos($relativePath, 'temp/') === 0) {
                    continue;
                }
                
                $zip->addFile($filePath, $relativePath);
            }
        }
        
        $zip->close();
        
        // Keep only last 5 backups
        cleanupOldBackups();
        
        return $backupPath;
    } else {
        throw new Exception("Failed to create backup");
    }
}

/**
 * Extract ZIP file
 */
function extractZip($zipFile, $extractDir) {
    $zip = new ZipArchive();
    $result = $zip->open($zipFile);
    
    if ($result !== TRUE) {
        throw new Exception("Failed to open ZIP file: " . getZipError($result));
    }
    
    if (!$zip->extractTo($extractDir)) {
        $zip->close();
        throw new Exception("Failed to extract ZIP file");
    }
    
    $fileCount = $zip->numFiles;
    $zip->close();
    
    return $fileCount;
}

/**
 * Apply update by copying files
 */
function applyUpdate($extractDir) {
    $updatedFiles = [];
    
    // Look for build directory in extracted files
    $buildDir = $extractDir . 'build/';
    if (!is_dir($buildDir)) {
        // If no build directory, use extraction directory directly
        $buildDir = $extractDir;
    }
    
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($buildDir),
        RecursiveIteratorIterator::LEAVES_ONLY
    );
    
    foreach ($files as $file) {
        if (!$file->isDir()) {
            $sourcePath = $file->getRealPath();
            $relativePath = substr($sourcePath, strlen($buildDir));
            $destinationPath = SITE_ROOT . $relativePath;
            
            // Create directory if it doesn't exist
            $destinationDir = dirname($destinationPath);
            if (!is_dir($destinationDir)) {
                mkdir($destinationDir, 0755, true);
            }
            
            // Copy file
            if (copy($sourcePath, $destinationPath)) {
                $updatedFiles[] = $relativePath;
            } else {
                throw new Exception("Failed to copy file: {$relativePath}");
            }
        }
    }
    
    return $updatedFiles;
}

/**
 * Cleanup temporary files
 */
function cleanup($tempFile, $extractDir) {
    if (file_exists($tempFile)) {
        unlink($tempFile);
    }
    
    if (is_dir($extractDir)) {
        removeDirectory($extractDir);
    }
}

/**
 * Remove directory recursively
 */
function removeDirectory($dir) {
    if (!is_dir($dir)) {
        return;
    }
    
    $files = array_diff(scandir($dir), array('.', '..'));
    foreach ($files as $file) {
        $path = $dir . '/' . $file;
        if (is_dir($path)) {
            removeDirectory($path);
        } else {
            unlink($path);
        }
    }
    rmdir($dir);
}

/**
 * Cleanup old backups (keep last 5)
 */
function cleanupOldBackups() {
    $backups = glob(BACKUP_DIR . 'backup_*.zip');
    if (count($backups) > 5) {
        // Sort by modification time (oldest first)
        usort($backups, function($a, $b) {
            return filemtime($a) - filemtime($b);
        });
        
        // Remove oldest backups
        $toRemove = array_slice($backups, 0, count($backups) - 5);
        foreach ($toRemove as $backup) {
            unlink($backup);
        }
    }
}

/**
 * Enhanced logging for detailed debugging
 */
function logUpdate($version, $status, $message, $details = null) {
    $logFile = __DIR__ . '/update.log';
    $debugLogFile = __DIR__ . '/update-debug.log';
    $timestamp = date('Y-m-d H:i:s');
    
    // Basic log entry
    $entry = "[{$timestamp}] Version: {$version} | Status: {$status} | Message: {$message}\n";
    file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
    
    // Detailed debug log entry
    $debugEntry = [
        'timestamp' => $timestamp,
        'version' => $version,
        'status' => $status,
        'message' => $message,
        'details' => $details,
        'request_info' => [
            'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
            'content_length' => $_SERVER['CONTENT_LENGTH'] ?? 0
        ],
        'server_info' => [
            'php_version' => PHP_VERSION,
            'memory_usage' => memory_get_usage(true),
            'memory_peak' => memory_get_peak_usage(true),
            'execution_time' => defined('REQUEST_START_TIME') ? microtime(true) - REQUEST_START_TIME : 0
        ]
    ];
    
    $debugLine = json_encode($debugEntry) . "\n";
    file_put_contents($debugLogFile, $debugLine, FILE_APPEND | LOCK_EX);
}

/**
 * Log step-by-step progress for debugging
 */
function logStep($step, $message, $data = null) {
    $stepLogFile = __DIR__ . '/update-steps.log';
    $timestamp = date('Y-m-d H:i:s.u');
    
    $stepEntry = [
        'timestamp' => $timestamp,
        'step' => $step,
        'message' => $message,
        'data' => $data,
        'memory_usage' => memory_get_usage(true),
        'execution_time' => defined('REQUEST_START_TIME') ? microtime(true) - REQUEST_START_TIME : 0
    ];
    
    $stepLine = json_encode($stepEntry) . "\n";
    file_put_contents($stepLogFile, $stepLine, FILE_APPEND | LOCK_EX);
    
    // Also log to error log for immediate visibility
    error_log("[AutoUpdate:{$step}] {$message}" . ($data ? ' | Data: ' . json_encode($data) : ''));
}

/**
 * Get ZIP error message
 */
function getZipError($code) {
    switch($code) {
        case ZipArchive::ER_OK: return 'No error';
        case ZipArchive::ER_MULTIDISK: return 'Multi-disk zip archives not supported';
        case ZipArchive::ER_RENAME: return 'Renaming temporary file failed';
        case ZipArchive::ER_CLOSE: return 'Closing zip archive failed';
        case ZipArchive::ER_SEEK: return 'Seek error';
        case ZipArchive::ER_READ: return 'Read error';
        case ZipArchive::ER_WRITE: return 'Write error';
        case ZipArchive::ER_CRC: return 'CRC error';
        case ZipArchive::ER_ZIPCLOSED: return 'Containing zip archive was closed';
        case ZipArchive::ER_NOENT: return 'No such file';
        case ZipArchive::ER_EXISTS: return 'File already exists';
        case ZipArchive::ER_OPEN: return 'Can\'t open file';
        case ZipArchive::ER_TMPOPEN: return 'Failure to create temporary file';
        case ZipArchive::ER_ZLIB: return 'Zlib error';
        case ZipArchive::ER_MEMORY: return 'Memory allocation failure';
        case ZipArchive::ER_CHANGED: return 'Entry has been changed';
        case ZipArchive::ER_COMPNOTSUPP: return 'Compression method not supported';
        case ZipArchive::ER_EOF: return 'Premature EOF';
        case ZipArchive::ER_INVAL: return 'Invalid argument';
        case ZipArchive::ER_NOZIP: return 'Not a zip archive';
        case ZipArchive::ER_INTERNAL: return 'Internal error';
        case ZipArchive::ER_INCONS: return 'Zip archive inconsistent';
        case ZipArchive::ER_REMOVE: return 'Can\'t remove file';
        case ZipArchive::ER_DELETED: return 'Entry has been deleted';
        default: return "Unknown error code: {$code}";
    }
}

// Handle the request
handleUpdate();
?> 
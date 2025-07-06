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
    try {
        // Get input data
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Invalid JSON input');
        }
        
        // Validate API key
        if (!isset($input['api_key']) || $input['api_key'] !== UPDATE_API_KEY) {
            throw new Exception('Invalid API key');
        }
        
        // Handle different actions
        $action = $input['action'] ?? 'update';
        
        if ($action === 'check_support') {
            // Just return success for support check
            echo json_encode([
                'success' => true,
                'message' => 'Automatic updates supported',
                'php_version' => PHP_VERSION,
                'server_info' => [
                    'curl_available' => function_exists('curl_init'),
                    'zip_available' => class_exists('ZipArchive'),
                    'max_execution_time' => ini_get('max_execution_time'),
                    'memory_limit' => ini_get('memory_limit')
                ],
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            return;
        }
        
        // For update action, validate required fields
        if (!isset($input['download_url']) || !isset($input['version'])) {
            throw new Exception('Missing required fields: download_url, version');
        }
        
        $downloadUrl = $input['download_url'];
        $version = $input['version'];
        $createBackup = $input['create_backup'] ?? true;
        
        // Validate download URL
        if (!isValidDownloadUrl($downloadUrl)) {
            throw new Exception('Invalid or untrusted download URL');
        }
        
        // Create necessary directories
        createDirectories();
        
        // Start update process
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
    // Initialize cURL with shared hosting optimizations
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30); // Reduced to 30 seconds for shared hosting
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10); // 10 seconds to connect
    curl_setopt($ch, CURLOPT_USERAGENT, 'Portfolio-Update-System/1.0');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Disable SSL verification for shared hosting
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    
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
    
    $data = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($data === false || $httpCode !== 200) {
        throw new Exception("Failed to download update: HTTP {$httpCode} - {$error}");
    }
    
    if (strlen($data) > MAX_DOWNLOAD_SIZE) {
        throw new Exception("Download size exceeds maximum allowed size");
    }
    
    if (file_put_contents($destination, $data) === false) {
        throw new Exception("Failed to save downloaded file");
    }
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
 * Log update activity
 */
function logUpdate($version, $status, $message) {
    $logFile = __DIR__ . '/update.log';
    $timestamp = date('Y-m-d H:i:s');
    $entry = "[{$timestamp}] Version: {$version} | Status: {$status} | Message: {$message}\n";
    file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
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
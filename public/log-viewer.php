<?php
/**
 * Secure Log Viewer Endpoint
 * 
 * Provides secure access to server-side update logs for debugging
 * Requires API key authentication and limits log access
 */

// Set error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Security configuration
define('LOG_API_KEY', 'sk_update_2024_portfolio_secure_key_255d78d54885303d0fc7564b88b70527'); // Same as update endpoint
define('MAX_LOG_LINES', 1000); // Maximum lines to return per request
define('MAX_LOG_SIZE', 5 * 1024 * 1024); // Maximum 5MB log file size to read

// Available log files
define('AVAILABLE_LOGS', [
    'update' => __DIR__ . '/update.log',
    'debug' => __DIR__ . '/update-debug.log', 
    'steps' => __DIR__ . '/update-steps.log'
]);

// Headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST and GET requests
if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'GET'])) {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

/**
 * Main log viewer handler
 */
function handleLogRequest() {
    try {
        // Get request data
        $input = null;
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
        } else {
            $input = $_GET;
        }
        
        if (!$input) {
            throw new Exception('Invalid request data');
        }
        
        // Validate API key
        if (!isset($input['api_key']) || $input['api_key'] !== LOG_API_KEY) {
            throw new Exception('Invalid API key');
        }
        
        $action = $input['action'] ?? 'list_logs';
        
        switch ($action) {
            case 'list_logs':
                echo json_encode(handleListLogs());
                break;
                
            case 'read_log':
                $logType = $input['log_type'] ?? '';
                $startLine = (int)($input['start_line'] ?? 0);
                $maxLines = min((int)($input['max_lines'] ?? 100), MAX_LOG_LINES);
                $tail = isset($input['tail']) ? (bool)$input['tail'] : false;
                
                echo json_encode(handleReadLog($logType, $startLine, $maxLines, $tail));
                break;
                
            case 'clear_log':
                $logType = $input['log_type'] ?? '';
                echo json_encode(handleClearLog($logType));
                break;
                
            case 'log_stats':
                echo json_encode(handleLogStats());
                break;
                
            default:
                throw new Exception('Unknown action: ' . $action);
        }
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
}

/**
 * List available logs with basic info
 */
function handleListLogs() {
    $logs = [];
    
    foreach (AVAILABLE_LOGS as $type => $path) {
        $info = [
            'type' => $type,
            'exists' => file_exists($path),
            'readable' => file_exists($path) && is_readable($path),
            'size' => 0,
            'lines' => 0,
            'last_modified' => null
        ];
        
        if ($info['exists'] && $info['readable']) {
            $info['size'] = filesize($path);
            $info['last_modified'] = date('Y-m-d H:i:s', filemtime($path));
            
            // Count lines (for smaller files only)
            if ($info['size'] < 1024 * 1024) { // Only for files < 1MB
                $info['lines'] = $info['size'] > 0 ? count(file($path)) : 0;
            } else {
                $info['lines'] = 'Large file - line count not available';
            }
        }
        
        $logs[] = $info;
    }
    
    return [
        'success' => true,
        'logs' => $logs,
        'timestamp' => date('Y-m-d H:i:s')
    ];
}

/**
 * Read log file content
 */
function handleReadLog($logType, $startLine = 0, $maxLines = 100, $tail = false) {
    if (!isset(AVAILABLE_LOGS[$logType])) {
        throw new Exception('Invalid log type: ' . $logType);
    }
    
    $logPath = AVAILABLE_LOGS[$logType];
    
    if (!file_exists($logPath)) {
        return [
            'success' => true,
            'log_type' => $logType,
            'content' => [],
            'total_lines' => 0,
            'message' => 'Log file does not exist yet'
        ];
    }
    
    if (!is_readable($logPath)) {
        throw new Exception('Log file is not readable');
    }
    
    $fileSize = filesize($logPath);
    if ($fileSize > MAX_LOG_SIZE) {
        throw new Exception('Log file too large. Maximum size: ' . (MAX_LOG_SIZE / 1024 / 1024) . 'MB');
    }
    
    // Read file content
    $lines = file($logPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $totalLines = count($lines);
    
    // Handle tail mode (get last N lines)
    if ($tail) {
        $lines = array_slice($lines, -$maxLines);
        $startLine = max(0, $totalLines - $maxLines);
    } else {
        // Handle pagination
        $lines = array_slice($lines, $startLine, $maxLines);
    }
    
    // Process lines for better display
    $processedLines = [];
    foreach ($lines as $index => $line) {
        $lineNumber = $startLine + $index + 1;
        
        // Try to parse JSON lines (for debug and steps logs)
        $parsedData = null;
        if (in_array($logType, ['debug', 'steps']) && trim($line)) {
            $decoded = json_decode($line, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $parsedData = $decoded;
            }
        }
        
        $processedLines[] = [
            'line_number' => $lineNumber,
            'content' => $line,
            'parsed_data' => $parsedData,
            'timestamp' => extractTimestamp($line, $logType)
        ];
    }
    
    return [
        'success' => true,
        'log_type' => $logType,
        'content' => $processedLines,
        'total_lines' => $totalLines,
        'returned_lines' => count($processedLines),
        'start_line' => $startLine + 1,
        'file_size' => $fileSize,
        'last_modified' => date('Y-m-d H:i:s', filemtime($logPath))
    ];
}

/**
 * Clear log file (with backup)
 */
function handleClearLog($logType) {
    if (!isset(AVAILABLE_LOGS[$logType])) {
        throw new Exception('Invalid log type: ' . $logType);
    }
    
    $logPath = AVAILABLE_LOGS[$logType];
    
    if (!file_exists($logPath)) {
        return [
            'success' => true,
            'message' => 'Log file does not exist',
            'log_type' => $logType
        ];
    }
    
    // Create backup before clearing
    $backupPath = $logPath . '.backup.' . date('Y-m-d_H-i-s');
    if (!copy($logPath, $backupPath)) {
        throw new Exception('Failed to create backup before clearing log');
    }
    
    // Clear the log file
    if (!file_put_contents($logPath, '')) {
        throw new Exception('Failed to clear log file');
    }
    
    return [
        'success' => true,
        'message' => 'Log cleared successfully',
        'log_type' => $logType,
        'backup_created' => $backupPath
    ];
}

/**
 * Get log statistics
 */
function handleLogStats() {
    $stats = [
        'total_logs' => count(AVAILABLE_LOGS),
        'total_size' => 0,
        'logs' => []
    ];
    
    foreach (AVAILABLE_LOGS as $type => $path) {
        $logStat = [
            'type' => $type,
            'exists' => file_exists($path),
            'size' => 0,
            'size_human' => '0 B',
            'last_modified' => null,
            'recent_entries' => 0
        ];
        
        if ($logStat['exists']) {
            $logStat['size'] = filesize($path);
            $logStat['size_human'] = formatBytes($logStat['size']);
            $logStat['last_modified'] = date('Y-m-d H:i:s', filemtime($path));
            $stats['total_size'] += $logStat['size'];
            
            // Count recent entries (last hour)
            $oneHourAgo = time() - 3600;
            if ($logStat['size'] < 1024 * 1024) { // Only for files < 1MB
                $lines = file($path);
                $recentCount = 0;
                foreach ($lines as $line) {
                    $timestamp = extractTimestamp($line, $type);
                    if ($timestamp && strtotime($timestamp) > $oneHourAgo) {
                        $recentCount++;
                    }
                }
                $logStat['recent_entries'] = $recentCount;
            }
        }
        
        $stats['logs'][] = $logStat;
    }
    
    $stats['total_size_human'] = formatBytes($stats['total_size']);
    
    return [
        'success' => true,
        'stats' => $stats,
        'timestamp' => date('Y-m-d H:i:s')
    ];
}

/**
 * Extract timestamp from log line
 */
function extractTimestamp($line, $logType) {
    if ($logType === 'update') {
        // Format: [2024-01-01 12:00:00] ...
        if (preg_match('/^\[([^\]]+)\]/', $line, $matches)) {
            return $matches[1];
        }
    } elseif (in_array($logType, ['debug', 'steps'])) {
        // JSON format with timestamp field
        $decoded = json_decode($line, true);
        if (json_last_error() === JSON_ERROR_NONE && isset($decoded['timestamp'])) {
            return $decoded['timestamp'];
        }
    }
    
    return null;
}

/**
 * Format bytes to human readable format
 */
function formatBytes($bytes, $precision = 2) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}

/**
 * Security check - ensure we're not being accessed directly in production
 */
function securityCheck() {
    // Add additional security checks here if needed
    // For example, check referring domain, IP whitelist, etc.
    return true;
}

// Main execution
if (securityCheck()) {
    handleLogRequest();
} else {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Access denied']);
} 
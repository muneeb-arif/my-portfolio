<?php
/**
 * Test script for update-endpoint.php functionality
 * 
 * This script tests:
 * 1. Server support check
 * 2. Update process with a sample ZIP file
 */

// Configuration
$UPDATE_ENDPOINT_URL = 'http://localhost:8000/update-endpoint.php';
$API_KEY = 'sk_update_2024_portfolio_secure_key_255d78d54885303d0fc7564b88b70527';

// Test data
$testData = [
    'support_check' => [
        'api_key' => $API_KEY,
        'action' => 'check_support'
    ],
    'update_test' => [
        'api_key' => $API_KEY,
        'action' => 'update',
        'download_url' => 'https://bpniquvjzwxjimeczjuf.supabase.co/storage/v1/object/public/updates/backup-2025-07-18T00-13-26-775Z-minimal-update.zip',
        'version' => 'test-1.0.0',
        'create_backup' => false, // Disable backup for testing
        'client_id' => 'test-client'
    ]
];

/**
 * Make HTTP request to update endpoint
 */
function makeRequest($url, $data) {
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Content-Length: ' . strlen(json_encode($data))
        ],
        CURLOPT_TIMEOUT => 120,
        CURLOPT_CONNECTTIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'http_code' => $httpCode,
        'response' => $response,
        'error' => $error
    ];
}

/**
 * Test server support check
 */
function testSupportCheck() {
    global $UPDATE_ENDPOINT_URL, $testData;
    
    echo "=== Testing Server Support Check ===\n";
    
    $result = makeRequest($UPDATE_ENDPOINT_URL, $testData['support_check']);
    
    echo "HTTP Code: {$result['http_code']}\n";
    
    if ($result['error']) {
        echo "cURL Error: {$result['error']}\n";
        return false;
    }
    
    if ($result['http_code'] !== 200) {
        echo "Request failed with HTTP code: {$result['http_code']}\n";
        echo "Response: {$result['response']}\n";
        return false;
    }
    
    $response = json_decode($result['response'], true);
    
    if (!$response) {
        echo "Failed to parse JSON response\n";
        echo "Raw response: {$result['response']}\n";
        return false;
    }
    
    if ($response['success']) {
        echo "✅ Support check passed!\n";
        echo "Message: {$response['message']}\n";
        echo "PHP Version: {$response['php_version']}\n";
        
        if (isset($response['server_info'])) {
            $info = $response['server_info'];
            echo "Server Capabilities:\n";
            echo "  - cURL Available: " . ($info['curl_available'] ? 'Yes' : 'No') . "\n";
            echo "  - ZIP Available: " . ($info['zip_available'] ? 'Yes' : 'No') . "\n";
            echo "  - Max Execution Time: {$info['max_execution_time']}\n";
            echo "  - Memory Limit: {$info['memory_limit']}\n";
            echo "  - Disk Space: " . round($info['disk_space'] / 1024 / 1024, 2) . " MB\n";
            
            if (isset($info['writable_dirs'])) {
                echo "  - Writable Directories:\n";
                foreach ($info['writable_dirs'] as $dir => $writable) {
                    echo "    - {$dir}: " . ($writable ? 'Yes' : 'No') . "\n";
                }
            }
        }
        
        return true;
    } else {
        echo "❌ Support check failed!\n";
        echo "Error: " . ($response['error'] ?? 'Unknown error') . "\n";
        return false;
    }
}

/**
 * Test update process
 */
function testUpdateProcess() {
    global $UPDATE_ENDPOINT_URL, $testData;
    
    echo "\n=== Testing Update Process ===\n";
    
    $result = makeRequest($UPDATE_ENDPOINT_URL, $testData['update_test']);
    
    echo "HTTP Code: {$result['http_code']}\n";
    
    if ($result['error']) {
        echo "cURL Error: {$result['error']}\n";
        return false;
    }
    
    if ($result['http_code'] !== 200) {
        echo "Request failed with HTTP code: {$result['http_code']}\n";
        echo "Response: {$result['response']}\n";
        return false;
    }
    
    $response = json_decode($result['response'], true);
    
    if (!$response) {
        echo "Failed to parse JSON response\n";
        echo "Raw response: {$result['response']}\n";
        return false;
    }
    
    if ($response['success']) {
        echo "✅ Update process completed successfully!\n";
        echo "Message: {$response['message']}\n";
        echo "Version: {$response['version']}\n";
        echo "Backup Created: " . ($response['backup_created'] ? 'Yes' : 'No') . "\n";
        echo "Files Updated: " . count($response['files_updated']) . "\n";
        echo "Extracted Files: {$response['extracted_files']}\n";
        echo "Timestamp: {$response['timestamp']}\n";
        
        // Show some updated files
        if (!empty($response['files_updated'])) {
            echo "Sample Updated Files:\n";
            $sampleFiles = array_slice($response['files_updated'], 0, 5);
            foreach ($sampleFiles as $file) {
                echo "  - {$file}\n";
            }
            if (count($response['files_updated']) > 5) {
                echo "  ... and " . (count($response['files_updated']) - 5) . " more files\n";
            }
        }
        
        return true;
    } else {
        echo "❌ Update process failed!\n";
        echo "Error: " . ($response['error'] ?? 'Unknown error') . "\n";
        return false;
    }
}

/**
 * Check log files
 */
function checkLogFiles() {
    echo "\n=== Checking Log Files ===\n";
    
    $logFiles = [
        'update.log' => 'Main update log',
        'update-debug.log' => 'Debug log',
        'update-steps.log' => 'Step-by-step log'
    ];
    
    foreach ($logFiles as $file => $description) {
        $logPath = __DIR__ . '/../public/' . $file;
        
        if (file_exists($logPath)) {
            $size = filesize($logPath);
            $lines = count(file($logPath));
            echo "✅ {$description} ({$file}): {$size} bytes, {$lines} lines\n";
            
            // Show last few lines
            $lastLines = array_slice(file($logPath), -3);
            echo "  Last entries:\n";
            foreach ($lastLines as $line) {
                echo "    " . trim($line) . "\n";
            }
        } else {
            echo "❌ {$description} ({$file}): File not found\n";
        }
    }
}

/**
 * Check created directories and files
 */
function checkCreatedFiles() {
    echo "\n=== Checking Created Files ===\n";
    
    $dirs = [
        'backups' => 'Backup directory',
        'temp' => 'Temporary directory'
    ];
    
    foreach ($dirs as $dir => $description) {
        $dirPath = __DIR__ . '/../public/' . $dir;
        
        if (is_dir($dirPath)) {
            $files = scandir($dirPath);
            $fileCount = count($files) - 2; // Exclude . and ..
            echo "✅ {$description} ({$dir}): {$fileCount} files\n";
            
            if ($fileCount > 0) {
                echo "  Files:\n";
                foreach ($files as $file) {
                    if ($file !== '.' && $file !== '..') {
                        $filePath = $dirPath . '/' . $file;
                        $size = is_file($filePath) ? filesize($filePath) : 'DIR';
                        $modified = date('Y-m-d H:i:s', filemtime($filePath));
                        echo "    - {$file} ({$size} bytes, {$modified})\n";
                    }
                }
            }
        } else {
            echo "❌ {$description} ({$dir}): Directory not found\n";
        }
    }
}

// Run tests
echo "Starting update-endpoint.php functionality test...\n";
echo "Endpoint URL: {$UPDATE_ENDPOINT_URL}\n";
echo "API Key: " . substr($API_KEY, 0, 10) . "...\n\n";

$supportCheckPassed = testSupportCheck();
$updateTestPassed = false;

if ($supportCheckPassed) {
    $updateTestPassed = testUpdateProcess();
}

checkLogFiles();
checkCreatedFiles();

echo "\n=== Test Summary ===\n";
echo "Support Check: " . ($supportCheckPassed ? '✅ PASSED' : '❌ FAILED') . "\n";
echo "Update Process: " . ($updateTestPassed ? '✅ PASSED' : '❌ FAILED') . "\n";

if ($supportCheckPassed && $updateTestPassed) {
    echo "\n🎉 All tests passed! The update-endpoint.php is functional.\n";
} else {
    echo "\n⚠️  Some tests failed. Check the logs for more details.\n";
}
?> 
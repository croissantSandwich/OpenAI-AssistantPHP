<?php

require 'api/threadAssistant.php';

$controller = new OpenAIController();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_GET['action'])) {
        switch ($_GET['action']) {
            case 'post':
                $controller->post();
                break;
            case 'run':
                $controller->runAssistant();
                break;
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
                break;
        }
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

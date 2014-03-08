<?php
ini_set('display_errors', 1);
error_reporting(E_STRICT|E_ALL);

require 'sequel.php';

define('RESULTS_PER_PAGE', 3);

$sql = new Sequel(new PDO(
    'mysql:dbname=forminator_demo;host=localhost',
    'root',
    'P0l.ar-B3ar'
));

function getWhereStartsWith(array $collection, $startOfKey) {
    $filtered = array();
    foreach($collection as $key => $value) {
        if(preg_match('/^' . $startOfKey . '/', $key)) {
            $filtered[$key] = $value;
        }
    }
    return $filtered;
}

function stripLeadingKey(array $collection, $startOfKey) {
    $stripped = array();
    foreach($collection as $key => $value) {
        $strippedKey = '';
        preg_replace('/^' . $startOfKey . '/', $strippedKey, $key);
        $stripped[$strippedKey] = $value;
    }
    return $stripped;
}

function getOrders() {
    return stripLeadingKey(getWhereStartsWith($_GET, 'order_'), 'order_');
}

function getFilters() {
    return stripLeadingKey(getWhereStartsWith($_GET, 'filter_'), 'filter_');
}

$response = null;
switch($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $where = implode(' AND ', array_map(function ($key) {
            return $key . ' = ?';
        }, array_keys(getFilters())));

        $orderArray = array();
        foreach(getOrders() as $key => $value) {
            $orderArray[] = $key . ' ' . $value;
        }
        $order = implode(', ', $orderArray);

        $pageNumber = (isset($_GET['page']) ? $_GET['page'] : 1) - 1;

        $results = array_map(
            function ($row) {
                $row['checkbox'] = explode(',', $row['checkbox']);
                $row['checkbox2'] = explode(',', $row['checkbox2']);
                return $row;
            },
            $sql->query(
                'SELECT * FROM forminator ' .
                ($where ? ' WHERE ' . $where : '') .
                ($order ? ' ORDER BY ' . $order : '') .
                ' LIMIT ' . (RESULTS_PER_PAGE * $pageNumber) . ', ' . RESULTS_PER_PAGE
            )->toArray()
        );

        $response = array('results' => $results, 'status' => 200);
        break;
    case 'POST':
        switch(strtolower($_GET['action'])) {
            case 'create':
                $id = $sql->insert('forminator', $_POST);
                $response = array('id' => $id, 'status' => 200);
                break;
            case 'update':
                $sql->update('forminator', $_POST);
                $response = array('status' => 200);
                break;
            case 'delete':
                $sql->delete('forminator', $_GET['id']);
                $response = array('status' => 200);
                break;
            default:
                throw new Exception('invalid action : ' . $_GET['action']);
        }
        break;
    default:
        throw new Exception('invalid request method: ' . $_SERVER['REQUEST_METHOD']);
}
echo json_encode($response);
?>

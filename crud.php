<?php
ini_set('display_errors', 1);
error_reporting(E_STRICT|E_ALL);

require 'sequel.php';

define('RESULTS_PER_PAGE', 15);


function uploadFile ($file) {
    if ($file["error"]) {
        return array('error' => $file['error']);
    }
    else {
        move_uploaded_file(
            $file["tmp_name"],
            "uploads/" . $file["name"]
        );

        return array(
            'name' => $file['name'],
            'type' => $file['type'],
            'size' => $file['size'],
            'tmp_name' => $file['tmp_name']
        );
    }
}

$fileResults = array();
foreach($_FILES ?: array() as $file) {
    $fileResults[] = uploadFile($file);
}




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
        $strippedKey = preg_replace('/^' . $startOfKey . '/','', $key);
        $stripped[$strippedKey] = $value;
    }
    return $stripped;
}

function wrapKeysWithBackticks(array $array) {
    $ticked = array();
    foreach($array as $key => $value) {
        $ticked['`' . $key . '`'] = $value;
    }
    return $ticked;
}

function getOrders() {
    return wrapKeysWithBackticks(
        stripLeadingKey(getWhereStartsWith($_GET, 'order_'), 'order_')
    );
}

function getFilters() {
    $filters =  wrapKeysWithBackticks(
        stripLeadingKey(getWhereStartsWith($_GET, 'filter_'), 'filter_')
    );

    foreach($filters as $key => $value) {
        if($key === '`text`') {
            $filters[$key] = '%' . $value . '%';
        }
    }

    return $filters;
}

function implodeArray(array $array) {
    return array_map(function ($value) {
        return is_array($value) ? implode(',', $value) : $value;
    }, $array);
}

function preparePOST() {
    $imploded = implodeArray($_POST);

    $wrapped = array();
    foreach($imploded as $key => $value) {
        $wrapped['`' . $key . '`'] = $value;
    }
    return $wrapped;
}

function mapOrderValue($value) {
    $map = array(
        'ascending' => 'ASC',
        'descending' => 'DESC'
    );
    return $map[$value];
}

$response = null;
switch($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $where = implode(' AND ', array_map(function ($key) {
            return $key === '`text`' ? $key . ' LIKE ?' : $key . ' = ?';
        }, array_keys(getFilters())));


        $orderArray = array();
        foreach(getOrders() as $key => $value) {
            $orderArray[] = $key . ' ' . mapOrderValue($value);
        }
        $order = implode(', ', $orderArray);

        $pageNumber = (isset($_GET['page']) ? $_GET['page'] : 1) - 1;

        $query = 'SELECT * FROM forminator ' .
                ($where ? ' WHERE ' . $where : '') .
                ($order ? ' ORDER BY ' . $order : '') .
                ' LIMIT ' . (RESULTS_PER_PAGE * $pageNumber) . ', ' . RESULTS_PER_PAGE;

        $resultsObject =  $sql->query(
            $query,
            array_values(implodeArray(getFilters()))
        );

        $results = array_map(
            function ($row) {
                $row['checkbox'] = explode(',', $row['checkbox']);
                $row['checkbox2'] = explode(',', $row['checkbox2']);
                return $row;
            },
            $resultsObject->toArray()
        );

        $count = $resultsObject->count();

        $response = array(
            'status' => 200,
            'results' => $results,
            'numberOfResults' => $count,
            'numberOfPages' => ceil($count / RESULTS_PER_PAGE)
        );
        break;
    case 'POST':
        switch(strtolower($_GET['action'])) {
            case 'create':
                $id = $sql->insert('forminator', preparePOST());
                $response = array(
                    'status' => 200,
                    'fields' => array('id' => $id),
                    'successMessage' => 'New item (id:' . $id . ') Created!');
                break;
            case 'update':
                if(isset($_POST['id']) && is_numeric($_POST['id'])) {
                    $sql->update('forminator', array_filter(preparePOST(), function ($value) {
                        return $value !== 'id';
                    }), array('id' => $_POST['id']));
                    $response = array(
                        'status' => 200,
                        'successMessage' => 'Updated!'
                    );
                }
                else {
                    $response = array(
                        'status' => 409,
                        'GLOBAL' => 'Update must have an id field.'
                    );
                }
                break;
            case 'delete':
                if(isset($_GET['id']) && is_numeric($_GET['id'])) {
                    $sql->delete('forminator', array('id' => $_GET['id']));
                    $response = array(
                        'status' => 200,
                        'GLOBAL' => 'Item id:' . $_GET['id'] . ' deleted.'
                    );
                }
                else {
                    $response = array(
                        'status' => 409,
                        'GLOBAL' => 'Delete must have id query parameter'
                    );
                }
                break;
            default:
                throw new Exception('invalid action: ' . $_GET['action']);
        }
        break;
    default:
        throw new Exception('invalid request method: ' . $_SERVER['REQUEST_METHOD']);
}
echo json_encode($response);
?>

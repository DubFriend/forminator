<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

function uploadFile ($file) {
    if ($file["error"][0]) {
        return array('error' => $file['error'][0]);
    }
    else {
        move_uploaded_file(
            $file["tmp_name"][0],
            "uploads/" . $file["name"][0]
        );

        return array(
            'name' => $file['name'][0],
            'type' => $file['type'][0],
            'size' => $file['size'][0],
            'tmp_name' => $file['tmp_name'][0]
        );
    }
}

$fileResults = array();
foreach($_FILES ?: array() as $file) {
    $fileResults[] = uploadFile($file);
}

if($_REQUEST['text'] === 'w') {
    http_response_code(409);
    echo json_encode(array(
        'text' => 'server doesnt like w',
        'GLOBAL' => 'server error occurred'
    ));
}
else {
    echo json_encode(array(
        'successMessage' => 'Success!',
        'requestData' => $_POST,
        'fileData' => $fileResults
    ));
}

?>

<?php
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

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


if(isset($_POST['text']) && $_POST['text'] === 'w') {
    echo json_encode(array(
        'status' => 409,
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

<?php
ini_set('display_errors', 1);
error_reporting(E_STRICT|E_ALL);

define('NUMBER_OF_ROWS_TO_GENERATE', 5000);

require '../sequel.php';

function getRandomFromArray(array $array) {
    return $array[rand(0, count($array) - 1)];
}

function getRandomFromArrayMultiple(array $array) {
    $returnArray = array();
    foreach($array as $value) {
        if(rand(0, 1)) {
            $returnArray[] = $value;
        }
    }
    return implode(',', $returnArray);
};

$names = explode("\n", file_get_contents('names.txt'));
function getRandomName($names, $numberOfNames = null) {
    $numberOfNames = $numberOfNames > 0 ? $numberOfNames : 1;
    $namesSample = array();
    for($i = 0; $i < $numberOfNames; $i += 1) {
        $namesSample[] = getRandomFromArray($names);
    }
    return implode(', ', $namesSample);
}

$sql = new Sequel(new PDO(
    'mysql:dbname=forminator_demo;host=localhost',
    'root',
    'P0l.ar-B3ar'
));

for($i = 0; $i < NUMBER_OF_ROWS_TO_GENERATE; $i += 1) {
    $sql->insert('forminator', array(
        'text' => getRandomName($names),
        'text2' => getRandomName($names, rand(0, 5)),
        'textarea' => getRandomName($names, rand(0, 5)),
        'textarea2' => getRandomName($names, rand(0, 5)),
        '`select`' => getRandomFromArray(array('a', 'b')),
        'select2' => getRandomFromArray(array('a', 'b')),
        'radio' => getRandomFromArray(array('a', 'b')),
        'radio2' => getRandomFromArray(array('a', 'b')),
        'checkbox' => getRandomFromArrayMultiple(array('a', 'b')),
        'checkbox2' => getRandomFromArrayMultiple(array('a', 'b'))
    ));
}
echo 'done';
?>

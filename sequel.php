<?php
//Wrapper to abstract the method of database access
//(implented with PDO)
class Sequel_Exception extends Exception {}

class Sequel {
    private $Connection;

    function __construct($Connection) {
        $this->Connection = $Connection;
    }

    function table($table) {
        return new Sequel_Table($table, $this);
    }

    function query($query, array $values = array()) {
        $Statement = $this->Connection->prepare($query);
        $isSuccess = $Statement->execute($values);
        switch($this->queryType($query)) {
            case "SELECT":
                return new Sequel_Results(
                    new Sequel_Counter(array(
                        "connection" => $this->Connection,
                        "values" => $values,
                        "query" => $query
                    )),
                    new Sequel_Iterator($Statement)
                );
                break;
            case "INSERT":
                if($isSuccess) {
                    return $this->Connection->lastInsertId();
                }
                else {
                    return false;
                }
                break;
            default:
                return $isSuccess;
        }
    }

    public function queryType($query) {
        $words = explode(" ", $query);
        if($words) {
            return strtoupper($words[0]);
        }
        else {
            throw new Sequel_Exception("Invalid Query");
        }
    }

    function one($query, array $values = array()) {
        return $this->query($query, $values)->next();
    }

    private function wrapKeysBackTicks(array $values) {
        $wrapped = array();
        foreach($values as $key => $value) {
            if($this->doesHaveBackTicks($key)) {
                $wrapped[$key] = $value;
            }
            else {
                $wrapped['`' . $key . '`'] = $value;
            }
        }
        return $wrapped;
    }

    private function doesHaveBackTicks($value) {
        return preg_match('/^`.*`$/', $value);
    }

    function select($table, array $where = array()) {
        $where = $this->wrapKeysBackTicks($where);
        $query = "SELECT * FROM $table";
        if(!empty($where)) {
            $query .= " WHERE " . $this->whereSql(array_keys($where));
        }
        return $this->query($query, array_values($where));
    }

    private function whereSql(array $columns) {
        $whereArray = array();
        foreach($columns as $column) {
            $whereArray[] = "$column = ?";
        }
        return implode(" AND ", $whereArray);
    }

    function selectOne($table, array $where = array()) {
        return $this->select($table, $where)->next();
    }

    function insert($table, array $values = array()) {
        $values = $this->wrapKeysBackTicks($values);
        return $this->query(
            "INSERT INTO $table (" . implode(", ", array_keys($values)) . ") " .
            "VALUES (" . $this->questionMarks(count($values)) . ")",
            array_values($values)
        );
    }

    function update($table, array $values = array(), array $where = array()) {
        $values = $this->wrapKeysBackTicks($values);
        $where = $this->wrapKeysBackTicks($where);
        $setArray = array();
        foreach(array_keys($values) as $key) {
            $setArray[] = "$key = ?";
        }
        return $this->query(
            "UPDATE $table SET " . implode(", ", $setArray) .
            " WHERE " . $this->whereSql(array_keys($where)),
            array_merge(array_values($values), array_values($where))
        );
    }

    function delete($table, array $where = array()) {
        $where = $this->wrapKeysBackTicks($where);
        return $this->query(
            "DELETE FROM $table WHERE " . $this->whereSql(array_keys($where)),
            array_values($where)
        );
    }

    private function questionMarks($number) {
        return implode(", ", array_fill(0, $number, "?"));
    }

    function beginTransaction() {
        return $this->Connection->beginTransaction();
    }

    function commit() {
        return $this->Connection->commit();
    }

    function rollBack() {
        return $this->Connection->rollBack();
    }
}


//Results Set Wrapper returned by calls to select
class Sequel_Results implements Iterator {
    private $Counter, $Iterator;
    function __construct($Counter, $Iterator) {
        $this->Counter = $Counter;
        $this->Iterator = $Iterator;
    }

    function toArray() {
        $arrayResults = array();
        while($row = $this->Iterator->next()) {
            $arrayResults[] = $row;
        }
        return $arrayResults;
    }

    function count() {
        return $this->Counter->count();
    }

    //does not support rewind (here to make Iterator interface happy)
    function rewind() { return $this->Iterator->rewind(); }
    function valid() { return $this->Iterator->valid(); }
    function current() { return $this->Iterator->current(); }
    function key() { return $this->Iterator->key(); }
    function next() { return $this->Iterator->next(); }
}


class Sequel_Iterator implements Iterator {
    private $Results,
            $isIterationStarted = false,
            $key = 0,
            $current;

    function __construct($Results) {
        $this->Results = $Results;
        $this->Results->setFetchMode(PDO::FETCH_ASSOC);
    }

    function rewind() {
        if(!$this->isIterationStarted) {
            $this->isIterationStarted = true;
            $this->current = $this->Results->fetch();
        }
        else {
            throw new Sequel_Exception("Does not support rewind.");
        }
    }

    function valid() {
        return $this->current !== false;
    }

    function current() {
        return $this->current;
    }

    function key() {
        return $this->key;
    }

    function next() {
        $this->isIterationStarted = true;
        $this->key += 1;
        $this->current = $this->Results->fetch();
        return $this->current;
    }
}


class Sequel_Counter {
    private $Connection,
            $values,
            $query,
            $count = null;

    function __construct(array $fig = array()) {
        $this->Connection = $fig['connection'];
        $this->values = $fig['values'];
        $this->query = $fig['query'];
    }

    //rowCount doesnt work for sqlite :(
    function count() {
        if($this->count === null) {
            $statement = $this->Connection->prepare(
                "SELECT COUNT(*) " . $this->predicate()
            );
            $statement->execute($this->values);
            $rows = $statement->fetch(\PDO::FETCH_NUM);
            $this->count = $rows[0];
        }
        return $this->count;
    }

    // removes the "SELECT" and "LIMIT" portions of the query.
    private function predicate() {
        $predicate = preg_replace('/.* FROM /i', '', $this->query);
        $predicate = preg_replace('/ LIMIT .*/i', '', $predicate);
        return  ' FROM ' . $predicate;
    }
}
?>

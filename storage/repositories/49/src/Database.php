<?php namespace App;

class Database {
    private static $pdo;
    public static function get() {
        if (!self::$pdo) {
            self::$pdo = new \PDO(DB_DSN, DB_USER, DB_PASS);
            self::$pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        }
        return self::$pdo;
    }
}


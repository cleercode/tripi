<?php 
    $db = pg_connect("dbname=tripi user=tripi");

    if(!$db)
    {
        die("<h1>ERROR</h1>Could not connect to database");
    }
    else
    {
        pg_prepare("INSERTURL", "INSERT INTO refs VALUES (DEFAULT, $1, $2, NOW())");
        pg_prepare("GETURL", "SELECT * FROM refs WHERE short=$1");

        if(isset($_GET['type']))
        {
            $type = $_GET['type'];

            if($type == "NEW")
            {
                if(!isset($_GET['data']))
                {
                    echo "{success: false}";
                }
                else
                {
                    $data = $_GET['data'];
                    //@todo: make a better hash?
                    $hash = md5((microtime()).$data);
                    pg_query_params("INSERT INTO refs VALUES (DEFAULT, $1, $2, NOW())", Array($hash, $data));
                    echo "{success: true, string: \"".$hash."\"}";
                }
            }
            else if($type == "GET")
            {
                if(!isset($_GET['short']))
                {
                    echo "{success: false}";
                }
                else
                {
                    $short = $_GET['short'];
                    $info = pg_query_params("SELECT * FROM refs WHERE short=$1", Array($short));
                    $row = pg_fetch_assoc($info);
                    echo "{success: true, data: \"".$row['data']."\"}";
                }
            }
            else
            {
                echo "{success: false}";
            }
        }
        else
        {
            echo "{success: false}";
        }
    }

?>

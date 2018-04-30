<?php //if ( ! defined('BASEPATH')) exit('No direct script access allowed');
//
//    class verificationDocuments {
//
//        public function __construct(){
//           // $this->dbh = DatabasePDO::getInstance();
//        }
//
//        public function getAllDocuments() {
//
//
//        $salt = '123TradeSalt';
//        $result = json_decode(@file_get_contents('https://nc.onetwotrade.com/ott?cmd=getAllUsersFiles'));
//
//
//
//        $docs = array();
//        $doc = array();
//
//
//        if ($result->success) {
//         // $verifications_from_platform = $this->getCustumerVerification();
//          foreach ($result->files as $file) {
//
//           if (strpos('temp'.$file->desc, 'File ') == FALSE) {
//
//            $doc['time'] 	=  $file->time;
//            $doc['user'] 	=  $file->user;
//            $doc['file'] 	=  $file->file;
//            $doc['desc'] 	=  $file->desc;
//            $doc['verif']  = $file->verif;
//            $doc['v'] 		=  $file->desc;
//            $doc['token'] 	= md5($file->user.$salt);
//
//
//
//             array_push($docs,$doc);
//
//           }
//
//
//          }
//
//
//        }
//
//
//        /*
//        $salt = '123TradeSalt';
//
//
//        $files = array();
//        foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator('/opt/bitnami/apps/onetwotrade-dev/system/cache/users/')) as $filename) {
//          if (strpos($filename,'/.') == false) {
//            array_push($files,$filename);
//          }
//        }
//
//        usort($files, function($a, $b) {return filemtime($a) < filemtime($b);});
//
//        $docs = array();
//        $doc = array();
//
//        foreach ($files as $file) {
//          $elements = explode('/', $file);
//          $doc['time'] =  gmdate("Y-m-d H:i", filemtime($file));
//          $doc['user'] =  $elements[count($elements)-2];
//          $doc['file'] =  $elements[count($elements)-1];
//          $doc['desc'] =  ucwords(strtolower(str_replace("_"," ",preg_replace('/\.[^.]+$/','',$doc['file']))));
//          $doc['token'] = md5($doc['user'].$salt);
//
//          array_push($docs,$doc);
//        }
//
//        return $docs;
//          */
//
//          return $docs;
//        }
        
    /*public function getCustumerVerification(){
    		require_once "db.php";
           $spotDB = new spotDB_TradingPlatform();  
           $sql = "SELECT id , verification FROM customers WHERE id > 0;";
           return $spotDB->fetchAll($sql);
        }*/
//
//    }
//
//?>

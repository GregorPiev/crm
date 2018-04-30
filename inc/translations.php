<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

    class translations {
        
        private $cmsDB;
        
        public function __construct(){
            $this->cmsDB = new cmsDB();            
        }
        
        public function getLangs() {
            
          $sql = "SELECT lang, name FROM lang WHERE lang<>'en'";
          $results = $this->cmsDB->fetchAll($sql);
          
          
          return $results;
          
          
       
        
        
        }
                
        public function getAllPages($cc,$all) {
        
           $olang = 'en';
           
           if ($cc=='zht')
            $olang = 'zh';
            
          $sql = "SELECT id_page, GROUP_CONCAT(lang SEPARATOR '||') as lang,GROUP_CONCAT(title SEPARATOR '||') as title, GROUP_CONCAT(subtitle SEPARATOR '||') as subtitle, GROUP_CONCAT(nav_title SEPARATOR '||') as navtitle  FROM `page_lang` WHERE (lang='".$olang."' OR lang='".$cc."') GROUP BY id_page;";
          $results = $this->cmsDB->fetchAll($sql);
          
          
          $data = array();
          
          
          foreach ($results as $row) {
            $lang = explode('||',$row['lang']);
            $e = ($lang[0]==$olang) ? 0 : 1;
            $o = ($lang[0]==$olang) ? 1 : 0;
             
            if ($e) {
              $title = explode('||',strstr($row['title'], '||') ? $row['title'] : '||'.$row['title']);
              $subtitle = explode('||',strstr($row['subtitle'], '||') ? $row['subtitle'] : '||'.$row['subtitle']);
              $navtitle = explode('||',strstr($row['navtitle'], '||') ? $row['navtitle'] : '||'.$row['navtitle']);
            } else {
              $title = explode('||',strstr($row['title'], '||') ? $row['title'] : $row['title'].'||');
              $subtitle = explode('||',strstr($row['subtitle'], '||') ? $row['subtitle'] : $row['subtitle'].'||');
              $navtitle = explode('||',strstr($row['navtitle'], '||') ? $row['navtitle'] : $row['navtitle'].'||');
            }
            
            
                
              $addit = true;
                
              if (!$all) {
              
              $addit = false;
              
                if ($title[$e]!='')
                  $addit = ($title[$o]=='') ? true : false;
                
                if ($subtitle[$e]!='')
                  $addit = ($subtitle[$o]=='') ? true : $addit;
                
                if ($navtitle[$e]!='')
                  $addit = ($navtitle[$o]=='') ? true : $addit;
                
              }
              
              if ($addit)
                $data[$row['id_page']] = array( "en" =>     array("title" => $title[$e],
                                                                  "subtitle" => $subtitle[$e],
                                                                  "navtitle" => $navtitle[$e])
                                                ,
                                                "other" =>  array("title" => $title[$o],
                                                                  "subtitle" => $subtitle[$o], 
                                                                  "navtitle" => $navtitle[$o])
                                                ); 
                                                
             
                                                          
            
          
          
          }
          return $data;
          
          
       
        
        
        }
        
     
             public function getAllOthersProgress($cc) {
            
          
          $other = array();
          $data = array();
          $olang = 'en';
          
          if ($cc=='zht')
            $olang = 'zh';
            
            
          require_once "/opt/ott/sites/onetwotrade/www/themes/onetwotrade/language/".$olang."/theme_lang.php";
          $english = $lang;
          unset($lang);
          
          
          
          if (file_exists("/opt/ott/sites/onetwotrade/www/themes/onetwotrade/language/".$cc."/theme_lang.php")) {
            require_once "/opt/ott/sites/onetwotrade/www/themes/onetwotrade/language/".$cc."/theme_lang.php";
            $other = $lang;          
          }
          
          $countAll = 0;
          $countMissing = 0;
          
          foreach ($english as $key => $value) {
          
          $addit = true;
                
          if (!$all) {
            if ($value!='') {
              $countAll = $countAll + 1;
              $addit = ((isset($other[$key]) ? $other[$key] : "")=='') ? true : false;
            }
              
          }
          
          if ($addit &&  $value!='')
            $countMissing = $countMissing + 1; 
            $data[$key] = array ("en" => $value, "other" => isset($other[$key]) ? $other[$key] : "");
              
          }
          
          return ($countMissing/$countAll);
          
          
       
        
        
        }
        
        
        
        public function getAllOthers($cc,$all) {
            
          $other = array();
          $data = array();
          $olang = 'en';
          
           if ($cc=='zht')
            $olang = 'zh';
            
          require_once "/opt/ott/sites/onetwotrade/www/themes/onetwotrade/language/".$olang."/theme_lang.php";
          $english = $lang;
          unset($lang);
          
          
          
          if (file_exists("/opt/ott/sites/onetwotrade/www/themes/onetwotrade/language/".$cc."/theme_lang.php")) {
            require_once "/opt/ott/sites/onetwotrade/www/themes/onetwotrade/language/".$cc."/theme_lang.php";
            $other = $lang;          
          }
          
          foreach ($english as $key => $value) {
          
          $addit = true;
                
          if (!$all) {
            if ($value!='')
              $addit = ((isset($other[$key]) ? $other[$key] : "")=='') ? true : false;
          }
          
          if ($addit &&  $value!='') 
            $data[$key] = array ("en" => $value, "other" => isset($other[$key]) ? $other[$key] : "");
              
          }
          
          return $data;
          
          
       
        
        
        }
        
        
        
                public function getAllArticles($cc,$all) {
            
          $olang = 'en';
          
          if ($cc=='zht')
            $olang = 'zh';
            
          $sql = "SELECT page_article.id_page, article_lang.id_article, GROUP_CONCAT(lang SEPARATOR '||') as lang,GROUP_CONCAT(title SEPARATOR '||') as title, GROUP_CONCAT(subtitle SEPARATOR '||') as subtitle, GROUP_CONCAT(content SEPARATOR '||') as content  FROM article_lang,page_article WHERE page_article.id_page <> 20 AND page_article.id_page <> 93 AND (page_article.id_page <> 38 OR article_lang.content != '') AND article_lang.id_article <> 308 AND page_article.id_article=article_lang.id_article AND (article_lang.lang='".$olang."' OR article_lang.lang='".$cc."') GROUP BY article_lang.id_article;";
          $results = $this->cmsDB->fetchAll($sql);
          
          $data = array();
          
          
          foreach ($results as $row) {
            $lang = explode('||',$row['lang']);
            $e = ($lang[0]==$olang) ? 0 : 1;
            $o = ($lang[0]==$olang) ? 1 : 0;
             
            if ($e) {
              $title = explode('||',strstr($row['title'], '||') ? $row['title'] : '||'.$row['title']);
              $subtitle = explode('||',strstr($row['subtitle'], '||') ? $row['subtitle'] : '||'.$row['subtitle']);
              $content = explode('||',strstr($row['content'], '||') ? $row['content'] : '||'.$row['content']);
            } else {
              $title = explode('||',strstr($row['title'], '||') ? $row['title'] : $row['title'].'||');
              $subtitle = explode('||',strstr($row['subtitle'], '||') ? $row['subtitle'] : $row['subtitle'].'||');
              $content = explode('||',strstr($row['content'], '||') ? $row['content'] : $row['content'].'||');
            }
            
            
            
                
              $addit = true;
                
              if (!$all) {
              
              $addit = false;
              
                if ($title[$e]!='')
                  $addit = ($title[$o]=='') ? true : false;
                
                if ($subtitle[$e]!='')
                  $addit = ($subtitle[$o]=='') ? true : $addit;
                
                if ($content[$e]!='')
                  $addit = ($content[$o]=='') ? true : $addit;
                
              }
              
              if ($addit)
                $data[$row['id_article']] = array("en" =>     array("title" => $title[$e],
                                                                  "subtitle" => $subtitle[$e],
                                                                  "content" =>  $content[$e])
                                                ,
                                                "other" =>  array("title" => $title[$o],
                                                                  "subtitle" => $subtitle[$o], 
                                                                  "content" => $content[$o])
                                                ); 
                                                
             
                                                          
            
          
          
          }
          return $data;
          
          
       
        
        
        }
        
        

    }

?>

<?php include_once '/opt/ott/sites/northstar/inc/config.php';

function getonlineCustomers(){
    $config = new config();

    $sql = "SELECT
                OneTwoTrade_platform.customers.id AS id,
                OneTwoTrade_platform.customers.FirstName,
                OneTwoTrade_platform.customers.LastName,
                OneTwoTrade_platform.country.name AS country,
                IF(OneTwoTrade_new_site.customers.spot_email = OneTwoTrade_platform.customers.email COLLATE utf8_unicode_ci,
                    OneTwoTrade_new_site.customers.email,
                    OneTwoTrade_platform.customers.email) AS email,
                OneTwoTrade_platform.campaigns.name,
                OneTwoTrade_platform.sub_campaigns.param,
                OneTwoTrade_platform.customers.saleStatus,
                OneTwoTrade_platform.customers.regTime,
                CONCAT(OneTwoTrade_platform.users.firstName,
                        ' ',
                        OneTwoTrade_platform.users.lastName) AS employee,
                OneTwoTrade_platform.customers.employeeInChargeId
            FROM
                OneTwoTrade_platform.customers
                    LEFT JOIN
                OneTwoTrade_platform.country ON (customers.Country = country.id)
                    LEFT JOIN
                OneTwoTrade_platform.campaigns ON (customers.campaignId = campaigns.id)
                    LEFT JOIN
                OneTwoTrade_platform.sub_campaigns ON (customers.subCampaignId = sub_campaigns.id)
                    LEFT JOIN
                OneTwoTrade_platform.users ON (customers.employeeInChargeId = users.id)
                    LEFT JOIN
                OneTwoTrade_new_site.customers ON OneTwoTrade_platform.customers.id = OneTwoTrade_new_site.customers.spot_id
            WHERE
                (lastLoginDate >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
                    OR lastTimeActive >= DATE_SUB(NOW(), INTERVAL 15 MINUTE))
                    AND isDemo = 0
                    AND firstDepositDate = 0";

    $pdo = new PDO('mysql:host='. $config::get_host_name('amazon') .';dbname=' . $config::get_db_name('platform') . ';charset=utf8', $config::get_user_name('amazon'), $config::get_pass('amazon'));
    $statement = $pdo->prepare($sql);
    $statement->execute();
    $result = $statement->fetchAll(PDO::FETCH_ASSOC);

    return $result;
}
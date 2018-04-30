<?php

namespace Omnipay\Gate2shop\Message;

use Omnipay\Common\Message\AbstractRequest;
use Omnipay\Gate2shop\CustomFieldBag;

/**
 * Gate2shop Purchase Request
 */
class PurchaseRequest extends AbstractRequest
{
    protected $liveEndpoint = 'https://secure.gate2shop.com/ppp/purchase.do';
    protected $testEndpoint = 'https://ppp-test.gate2shop.com/ppp/purchase.do';

    public function getTotalAmount()
    {
        $totalAmount = 0;

        foreach ($this->getItems() as $item) {
            $totalAmount += $item->getPrice();
        }

        return $this->formatCurrency($totalAmount);
    }

    public function getTimestamp()
    {
        return date('Y-m-d.h:i:s');
    }

    public function getMerchantSiteId()
    {
        return $this->getParameter('merchantSiteId');
    }

    public function setMerchantSiteId($value)
    {
        return $this->setParameter('merchantSiteId', $value);
    }

    public function getMerchantId()
    {
        return $this->getParameter('merchantId');
    }

    public function setMerchantId($value)
    {
        return $this->setParameter('merchantId', $value);
    }

    public function getSecretKey()
    {
        return $this->getParameter('secretKey');
    }

    public function setSecretKey($value)
    {
        return $this->setParameter('secretKey', $value);
    }

    public function getCustomData()
    {
        return $this->getParameter('customData');
    }

    public function setCustomData($value)
    {
        return $this->setParameter('customData', $value);
    }

    public function getCustomFields()
    {
        return $this->getParameter('customfields');
    }

    public function setCustomFields($customfields)
    {
        if ($customfields && !$customfields instanceof CustomFieldBag) {
            $customfields = new CustomFieldBag($customfields);
        }

        return $this->setParameter('customfields', $customfields);
    }

    public function getMerchantLocale()
    {
        $merchantLocales = array(
            'en'    => 'en_US',
            'it'    => 'it_IT',
            'es'    => 'Es_ES',
            'fr'    => 'fr_FR',
            'iw'    => 'iw_IL',
            'de'    => 'de_DE',
            'ar'    => 'ar_AA',
            'ru'    => 'ru_RU',
            'nl'    => 'nl_NL',
            'bg'    => 'bg_BG',
            'ja'    => 'ja_JP',
            'tr'    => 'tr_TR',
            'pt'    => 'pt_BR',
            'zh'    => 'zh_ZN',
            'lt'    => 'lt_LT',
            'sv'    => 'sv_SE',
            'sl'    => 'sl_SI',
            'da'    => 'da_DK',
            'pl'    => 'pl_PL',
            'sr'    => 'sr_RS',
            'hr'    => 'hr_HR',
            'ro'    => 'ro_RO'
        );

        return (isset($merchantLocales[$this->getParameter('merchantLocale')])) ?
            $merchantLocales[$this->getParameter('merchantLocale')] :
            $merchantLocales['en'];
    }

    public function setMerchantLocale($value)
    {
        return $this->setParameter('merchantLocale', $value);
    }

    public function getSkipBillingTab()
    {
        return $this->getParameter('skipBillingTab');
    }

    public function setSkipBillingTab($value)
    {
        return $this->setParameter('skipBillingTab', $value);
    }

    public function getSkipReviewTab()
    {
        return $this->getParameter('skipReviewTab');
    }

    public function setSkipReviewTab($value)
    {
        return $this->setParameter('skipReviewTab', $value);
    }

    public function getCustomSiteName()
    {
        return $this->getParameter('customSiteName');
    }

    public function setCustomSiteName($value)
    {
        return $this->setParameter('customSiteName', $value);
    }

    public function getData()
    {
        $this->validate('currency', 'items');

        $data = array();
        $data['encoding'] = 'utf-8';
        $data['merchant_id'] = $this->getMerchantId();
        $data['merchant_site_id'] = $this->getMerchantSiteId();
        $data['total_amount'] = $this->getTotalAmount();
        $data['currency'] = $this->getCurrency();
        $data['time_stamp'] = $this->getTimestamp();
        $data['version'] = '3.0.0';
        $data['merchantLocale'] = $this->getMerchantLocale();
        $data['customData'] = $this->getCustomData();

        foreach ($this->getItems() as $n => $item) {
            ++$n;
            $data["item_name_$n"] = $item->getName();
            $data["item_amount_$n"] = $this->formatCurrency($item->getPrice());
            $data["item_quantity_$n"] = $item->getQuantity();
        }
        $data['numberofitems'] = $this->getItems()->count();

        if ($this->getSkipBillingTab()) {
            $data['skip_billing_tab'] = $this->getSkipBillingTab();
        }

        if ($this->getSkipReviewTab()) {
            $data['skip_review_tab'] = $this->getSkipReviewTab();
        }

        if ($this->getCustomSiteName()) {
            $data['customSiteName'] = $this->getCustomSiteName();
        }

        if ($this->getCard()) {
            $data['first_name'] = $this->getCard()->getBillingFirstName();
            $data['last_name'] = $this->getCard()->getBillingLastName();
            $data['email'] = $this->getCard()->getEmail();
            $data['address1'] = $this->getCard()->getBillingAddress1();
            $data['address2'] = $this->getCard()->getBillingAddress2();
            $data['city'] = $this->getCard()->getBillingCity();
            $data['country'] = $this->getCard()->getBillingCountry();
            $data['state'] = $this->getCard()->getBillingState();
            $data['zip'] = $this->getCard()->getBillingPostcode();
            $data['phone1'] = $this->getCard()->getBillingPhone();
        }

        $customfields = $this->getCustomFields();
        foreach ($customfields as $n => $customfield) {
            $data[$customfield->getName()] = $customfield->getValue();
        }

        $data['checksum'] = $this->createChecksum($data['time_stamp']);

        return $data;
    }

    public function createChecksum($timestamp)
    {
        $secretKey = $this->getSecretKey();
        $merchantId = $this->getMerchantId();
        $currency = $this->getCurrency();
        $amount = $this->getTotalAmount();
        $itemList = '';
        foreach ($this->getItems() as $item) {
            $itemList .= $item->getName()
                      . $this->formatCurrency($item->getPrice())
                      . $item->getQuantity();
        }

        return md5(
            $secretKey .
            $merchantId .
            $currency .
            $amount .
            $itemList .
            $timestamp
        );
    }

    public function sendData($data)
    {
        return $this->response = new PurchaseResponse($this, $data);
    }

    public function getEndpoint()
    {
        return $this->getTestMode() ? $this->testEndpoint : $this->liveEndpoint;
    }
}

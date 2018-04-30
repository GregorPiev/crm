<?php

namespace Omnipay\Gate2shop\Message;

use Omnipay\Common\Message\AbstractResponse;

/**
 *  Gate2shop Complete Purchase Response
 */
class CompletePurchaseResponse extends AbstractResponse
{
    public function isSuccessful()
    {
        return $this->getErrCode() === '0';
    }

    public function getMessage()
    {
        // message & Error fields are generic enough to be useless for most cases.
        // Reason, however, consistently provides more informative messages.
        return isset($this->data['Reason']) ? $this->data['Reason'] : null;
    }

    public function getCode()
    {
        // OK, PENDING, or FAIL.
        return isset($this->data['ppp_status']) ? $this->data['ppp_status'] : null;
    }

    public function getErrCode()
    {
        return isset($this->data['ErrCode']) ? $this->data['ErrCode'] : null;
    }

    public function getExErrCode()
    {
        return isset($this->data['ExErrCode']) ? $this->data['ExErrCode'] : null;
    }

    public function getTransactionReference()
    {
        return isset($this->data['PPP_TransactionID']) ? $this->data['PPP_TransactionID'] : null;
    }
}

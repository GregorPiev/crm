> This is a work in progress and shouldn't be used at this stage.

# Omnipay: Gate2shop

**Gate2Shop driver for the Omnipay PHP payment processing library**

[![Build Status](https://travis-ci.org/mfauveau/omnipay-gate2shop.png?branch=master)](https://travis-ci.org/mfauveau/omnipay-gate2shop)
[![Latest Stable Version](https://poser.pugx.org/mfauveau/omnipay-gate2shop/version.png)](https://packagist.org/packages/mfauveau/omnipay-gate2shop)
[![Total Downloads](https://poser.pugx.org/mfauveau/omnipay-gate2shop/d/total.png)](https://packagist.org/packages/mfauveau/omnipay-gate2shop)

[Omnipay](https://github.com/omnipay/omnipay) is a framework agnostic, multi-gateway payment
processing library for PHP 5.3+. This package implements [Gate2shop](http://www.gate2shop.com/) support for Omnipay.

## Installation

Omnipay is installed via [Composer](http://getcomposer.org/). To install, simply add it
to your `composer.json` file:

```json
{
    "require": {
        "mfauveau/omnipay-gate2shop": "~2.0"
    }
}
```

And run composer to update your dependencies:

    $ curl -s http://getcomposer.org/installer | php
    $ php composer.phar update

## Basic Usage

The following gateways are provided by this package:

* Gate2shop

For general usage instructions, please see the main [Omnipay](https://github.com/omnipay/omnipay)
repository.

## Support

If you are having general issues with Omnipay, we suggest posting on
[Stack Overflow](http://stackoverflow.com/). Be sure to add the
[omnipay tag](http://stackoverflow.com/questions/tagged/omnipay) so it can be easily found.

If you want to keep up to date with release anouncements, discuss ideas for the project,
or ask more detailed questions, there is also a [mailing list](https://groups.google.com/forum/#!forum/omnipay) which
you can subscribe to.

If you believe you have found a bug, please report it using the [GitHub issue tracker](https://github.com/mfauveau/omnipay-gate2shop/issues),
or better yet, fork the library and submit a pull request.

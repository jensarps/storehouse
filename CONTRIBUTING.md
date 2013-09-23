_Do you have a contribution?  We welcome contributions, but please ensure that you read the following information
before issuing a pull request.  Also refer back to this document as a checklist before issuing your pull request._

# Before You Start

## Understanding the Basics

If you don't understand what a *pull request* is, or how to submit one, please refer to the [help documentation][]
provided by GitHub.

## Contributor License Agreement

We require all contributions, to be covered under the Dojo Foundation's [Contributor License Agreement][cla].  This can
be done electronically and essentially ensures that you are making it clear that your contributions are your
contributions, you have the legal right to contribute and you are transferring the copyright of your works to the Dojo
Foundation.

If you are an unfamiliar contributor to the committer assessing your pull request, it is best to make it clear how
you are covered by a CLA in the notes of the pull request.  The committer will [verify][claCheck] your status.

If your GitHub user id you are submitting your pull request from differs from the Dojo Community ID or e-mail address
which you have signed your CLA under, you should specifically note what you have your CLA filed under (and for CCLA
that you are listed under your companies authorised contributors).

# Submitting a Pull Request

The following are the general steps you should follow in creating a pull request.  Subsequent pull requests only need
to follow step 3 and beyond:

1. Fork the repository on GitHub
2. Clone the forked repository to your machine
3. Create a "feature" branch in your local repository
4. Make your changes and commit them to your local repository
5. Rebase and push your commits to your GitHub remote fork/repository
6. Issue a Pull Request to this repository
7. Your Pull Request is reviewed and merged into the repository

## Coding Style and Linting

Dojo has a very specific [coding style][styleguide].  All pull requests should adhere to this.

## Inline Documentation

Dojo has an inline API documentation called [DojoDoc][].  Any pull request should ensure it has updated the inline
documentation appropriately or added the appropriate inline documentation.

## Test Cases

If the pull request changes the functional behaviour or is fixing a defect, the unit test cases should be modified to
reflect this.  The committer reviewing your pull request is likely to request the appropriate changes in the test
cases.  Dojo utilises its own test harness called [D.O.H.][] and is available as part of the [dojo/util][] repository.

It is expected that you will have tested your changes against the existing test cases and appropriate platforms prior to
submitting your pull request.

## Licensing

All of your submissions are licensed under a dual "New" BSD/AFL license.


[help documentation]: http://help.github.com/send-pull-requests
[cla]: http://dojofoundation.org/about/cla
[claCheck]: http://dojofoundation.org/about/claCheck
[styleguide]: http://dojotoolkit.org/reference-guide/developer/styleguide.html
[DojoDoc]: http://dojotoolkit.org/reference-guide/developer/markup.html
[D.O.H.]: http://dojotoolkit.org/reference-guide/util/doh.html
[dojo/util]: https://github.com/dojo/util
# Security Policy

## Supported versions

Security fixes are applied on the default branch (`main`) of this repository.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security problems.

Report privately to the maintainer (**jango_blockchained**) via:

- GitHub Security Advisories on this repository (preferred), or
- A private channel linked from your GitHub profile

Include steps to reproduce, impact, and any suggested fix if you have one.

We will acknowledge receipt when possible and coordinate disclosure.

## Plugin supply chain

AXIS treats plugin URLs as executable code. This boilerplate is a template —
review any third-party plugin the same way you would review a browser
extension. Do not ship secrets in `configSchema` defaults or in the built ESM.

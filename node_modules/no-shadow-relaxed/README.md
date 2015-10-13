# no-shadow-relaxed

Rule for eslint for more relaxed no-shadow options

This wraps the existing no-shadow eslint rule with an extra option for `ignore`,
which represents any keys you want to allow to be shadowed.  For example, `err`
or `done` are sometimes allowed to be shadowed.

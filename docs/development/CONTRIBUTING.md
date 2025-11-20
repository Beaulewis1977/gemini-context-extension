# Contributing Guide

Thank you for considering contributing to the Gemini Context Extension!

## Ways to Contribute

- Report bugs
- Suggest features
- Improve documentation
- Submit pull requests
- Review code

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/gemini-context-extension.git`
3. Follow [SETUP.md](./SETUP.md) for development setup
4. Create a branch: `git checkout -b feature/my-contribution`

## Pull Request Process

1. **Before coding**: Open an issue to discuss major changes
2. **Write code**: Follow [CODE_STYLE.md](./CODE_STYLE.md)
3. **Add tests**: Ensure tests pass and coverage is maintained
4. **Update docs**: Document new features
5. **Run checks**: `npm run lint && npm test && npm run build`
6. **Commit**: Use conventional commits (see below)
7. **Push**: `git push origin feature/my-contribution`
8. **PR**: Open pull request with clear description

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples

```
feat(wiki): add custom section support
fix(search): handle empty queries gracefully
docs(readme): update installation instructions
test(analyzer): add edge case tests for monorepos
```

## Code Review

All submissions require review. We aim to:

- Respond within 2 business days
- Provide constructive feedback
- Be respectful and inclusive

## Issue Guidelines

### Bug Reports

Include:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Node.js version)
- Relevant logs/screenshots

### Feature Requests

Include:
- Use case / motivation
- Proposed solution
- Alternatives considered
- Additional context

## Code of Conduct

Be respectful, inclusive, and professional. Harassment and inappropriate behavior will not be tolerated.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

- 💬 [GitHub Discussions](https://github.com/Beaulewis1977/gemini-context-extension/discussions)
- 🐛 [GitHub Issues](https://github.com/Beaulewis1977/gemini-context-extension/issues)

Thank you for contributing! 🎉

/**
 * README.md generator
 * Handles dynamic badges, conditional sections based on configuration
 */

import type { ProjectConfig } from "./types.js";

/**
 * Generates README.md with badges and conditional sections
 */
export function generateReadme(config: ProjectConfig): string {
  // Generate badges if GitHub username is provided
  const packageName = config.packageName || "<package-name>";
  const githubUsername = config.githubUsername || "<github-username>";
  const badges = `
[![npm version](https://badge.fury.io/js/${packageName}.svg)](https://badge.fury.io/js/${packageName})
![License](https://img.shields.io/npm/l/${packageName})
![Types](https://img.shields.io/npm/types/${packageName})

![NPM Downloads](https://img.shields.io/npm/dw/${packageName})
![Last Commit](https://img.shields.io/github/last-commit/oharu121/${packageName})
${
  config.useCodecov && config.testRunner !== "none"
    ? `![Coverage](https://codecov.io/gh/${githubUsername}/${packageName}/branch/main/graph/badge.svg)
`
    : ""
}${
  config.setupCI
    ? `![CI Status](https://github.com/${githubUsername}/${packageName}/actions/workflows/ci.yml/badge.svg)`
    : ""
}
![GitHub Stars](https://img.shields.io/github/stars/${githubUsername}/${packageName}?style=social)
`;

  const description =
    config.description || "A new npm package created with forge-npm-pkg.";

  return `# ${config.packageName}

${badges}${description}

## Installation

\`\`\`bash
npm install ${config.packageName}
\`\`\`

## Usage

\`\`\`${config.language}
import { greet } from '${config.packageName}';

console.log(greet('World')); // Hello, World!
\`\`\`

## Development

### Build

\`\`\`bash
npm run build
\`\`\`

${
  config.testRunner !== "none"
    ? `### Test

\`\`\`bash
npm test
\`\`\`
`
    : ""
}
${
  config.useLinting
    ? `### Lint

\`\`\`bash
npm run lint
npm run format
\`\`\`
`
    : ""
}
${
  config.language === "typescript"
    ? `### Validate Package Exports

\`\`\`bash
npm run check:exports
\`\`\`
`
    : ""
}
${
  config.useChangesets
    ? `## Release Workflow

This package uses [Changesets](https://github.com/changesets/changesets) for version management and automated releases.

### Creating a Release

1. **Make your changes** and commit them
2. **Create a changeset:**
   \`\`\`bash
   npm run changeset
   \`\`\`
   Select the type of change (major/minor/patch) and provide a description
3. **Commit the changeset:**
   \`\`\`bash
   git add .
   git commit -m "feat: your feature description"
   git push
   \`\`\`
4. **Merge the "Version Packages" PR** created by the Changesets bot
5. **Package automatically publishes to npm** 🎉

### Available Scripts

- \`npm run changeset\` - Create a new changeset (run this for each change)
- \`npm run version-packages\` - Bump versions based on changesets (automated via CI)
- \`npm run release\` - Publish to npm (automated via CI - **do not run manually!**)

**⚠️ Important:** The \`release\` script is automatically run by GitHub Actions. Running it manually may cause unexpected behavior.

`
    : ""
}
${
  config.githubUsername
    ? `## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you encounter any issues, please report them [here](https://github.com/${config.githubUsername}/${config.packageName}/issues).

`
    : ""
}
## License

MIT${config.author ? ` © ${config.author}` : ""}
`;
}

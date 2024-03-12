<img src="./static/img/subspace-network.svg" align="center" />

This repository contains the formal specifications of the Subspace Network protocol. For a more approachable description of the protocol, check out the [Subnomicon](https://subnomicon.subspace.network), which provides a comprehensive overview of the current state of protocol.

Ideally, the specification in this repository should be considered the canonical source of truth for the Subspace Network protocol. Currently, the specifications do not cover the full stack, but it is one of the goals of the project to do so.

New developments to the [protocol code](https://github.com/subspace/subspace/pulls) should be preceded by a pull request to this repository, accompanied by a discussion in the [Forum](https://forum.subspace.network) to ensure that the stakeholders are aligned on the changes. If there is not yet a relevant section in the specifications, consider adding it to help cover the new (or updated) functionality.
When the existing implementation is found to diverge from the specifications, the implementation should be considered a bug. 
If you have any additions or corrections, please submit a pull request.

### Contributing

If you would like to contribute check out the following materials, and feel free to ask questions in our [Discord](https://discord.gg/subspace-network)

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Development Guide](DEVELOPMENT.md)


### Setting Up Your Local Environment for Contribution

To ensure that your contributions include your name in the `last_update` section of documentation files automatically, follow these steps to set up your local environment:

#### Creating a `.env` File

1. At the root of your local repository clone, create a file named `.env`.
2. Inside the `.env` file, add the following line, replacing `"Your Name"` with your actual name:

```sh
AUTHOR_NAME="Your Name"
```

3. Save and close the `.env` file. This file will be used by the pre-commit hook to automatically insert your name into the `last_update` section of Markdown files.

#### Installing the Pre-commit Package

The pre-commit package is used to run scripts before each commit automatically, allowing us to update the documentation's `last_update` section seamlessly.

1. Install pre-commit on your system. If you're using pip (Python's package manager), you can install it by running:

```bash
pip install pre-commit
```

2. Make sure the update_last_update.sh script is present in the scripts/ directory at the root of your repository and is executable. You may need to run chmod +x scripts/update_last_update.sh to make it executable.

3. Run following command to set up the hook.
```bash
pre-commit install
```

With these steps completed, your local environment is set up to automatically update the last_update section of Markdown files with your name and the current date whenever you make a commit. This process helps maintain accurate documentation and attribution for contributions.


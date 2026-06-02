{
  description = "Markdown Review - Neovim plugin with review comments";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }@inputs:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };

        markdown-review-plugin = pkgs.vimUtils.buildVimPlugin {
          name = "markdown-review.nvim";
          src = ./.;
        };

        nvimWithPlugin = pkgs.wrapNeovimUnstable pkgs.neovim {
          plugins = [ markdown-review-plugin ];
        };

      in
      {
        packages.default = nvimWithPlugin;

        devShells.default = pkgs.mkShell {
          name = "markdown-review-dev";
          description = "Development environment for markdown-review plugin";
          buildInputs = with pkgs; [
            nvimWithPlugin
            nodejs_22
            yarn
            typescript
            pkg-config
            git
            gh
          ];

          shellHook = ''
            export PLUGIN_DIR="${./.}"
            echo "╔═══════════════════════════════════════════════╗"
            echo "║  Markdown Review Development Environment      ║"
            echo "╚═══════════════════════════════════════════════╝"
            echo ""
            echo "Development tools:"
            echo "  • nvim        - Neovim with markdown-review plugin"
            echo "  • yarn        - Package manager (for app development)"
            echo "  • node        - Node.js for backend/app"
            echo "  • typescript  - TypeScript compiler"
            echo ""
            echo "To start Neovim with the plugin:"
            echo "  nvim README.md"
            echo ""
          '';
        };
      }
    );
}

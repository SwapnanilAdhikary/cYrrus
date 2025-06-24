{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    # Core development tools
    bun                    # Fast JavaScript runtime and package manager
    nodejs_20              # Node.js LTS for compatibility
    electron               # Electron framework

    # Build tools and dependencies
    pkg-config
    python3                # Required for some native modules
    gcc                    # C compiler for native dependencies
    gnumake                # Make for building native modules

    # System libraries for Electron and GUI apps
    gtk3
    glib
    gdk-pixbuf
    cairo
    pango
    atk
    at-spi2-atk
    dbus
    libdrm
    xorg.libX11
    xorg.libXcomposite
    xorg.libXdamage
    xorg.libXext
    xorg.libXfixes
    xorg.libXrandr
    xorg.libXrender
    xorg.libXtst
    xorg.libxcb
    xorg.libXi
    xorg.libXcursor
    xorg.libXScrnSaver

    # Audio support (for Electron apps)
    alsa-lib
    pulseaudio

    # Graphics and rendering
    mesa
    libGL
    libGLU

    # Additional libraries for desktop integration
    libnotify
    libsecret
    nss
    nspr

    # Development utilities
    git                    # Version control
    curl                   # For downloading dependencies
    wget                   # Alternative downloader
    unzip                  # For extracting archives

    # Optional: useful development tools
    jq                     # JSON processor
    tree                   # Directory tree viewer
    htop                   # Process monitor
  ];

  # Environment variables
  shellHook = ''
    echo "🚀 Cluey 2.0 Development Environment"
    echo "=================================="
    echo "📦 Bun version: $(bun --version)"
    echo "🟢 Node.js version: $(node --version)"
    echo "⚡ Electron version: $(electron --version)"
    echo ""
    echo "Available commands:"
    echo "  bun install     - Install dependencies with Bun"
    echo "  bun start       - Start the Electron app"
    echo "  npm install     - Install dependencies with npm (fallback)"
    echo "  npm start       - Start the Electron app with npm"
    echo ""
    echo "🔧 Setting up environment variables..."

    # Set up library paths for Electron
    export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath [
      pkgs.gtk3
      pkgs.glib
      pkgs.gdk-pixbuf
      pkgs.cairo
      pkgs.pango
      pkgs.atk
      pkgs.at-spi2-atk
      pkgs.dbus
      pkgs.libdrm
      pkgs.xorg.libX11
      pkgs.xorg.libXcomposite
      pkgs.xorg.libXdamage
      pkgs.xorg.libXext
      pkgs.xorg.libXfixes
      pkgs.xorg.libXrandr
      pkgs.xorg.libXrender
      pkgs.xorg.libXtst
      pkgs.xorg.libxcb
      pkgs.xorg.libXi
      pkgs.xorg.libXcursor
      pkgs.xorg.libXScrnSaver
      pkgs.alsa-lib
      pkgs.pulseaudio
      pkgs.mesa
      pkgs.libGL
      pkgs.libGLU
      pkgs.libnotify
      pkgs.libsecret
      pkgs.nss
      pkgs.nspr
    ]}:$LD_LIBRARY_PATH"

    # Electron specific environment variables
    export ELECTRON_DISABLE_SANDBOX=1
    export ELECTRON_ENABLE_LOGGING=1

    # Ensure Bun uses the correct Node.js version
    export BUN_RUNTIME_TRANSPILER_CACHE_PATH="$PWD/.bun-cache"

    # Python path for native modules
    export PYTHON="${pkgs.python3}/bin/python"

    # Display server configuration
    export DISPLAY=''${DISPLAY:-:0}

    echo "✅ Environment ready!"
    echo ""
    echo "💡 Tips:"
    echo "  - Use 'bun install' for faster dependency installation"
    echo "  - Run 'bun start' to launch the Electron app"
    echo "  - The app uses Ctrl+Shift+O to toggle overlay"
    echo "  - The app uses Ctrl+Shift+A for screen capture"
    echo ""
  '';

  # Additional environment variables for the shell
  NIX_SHELL_PRESERVE_PROMPT = 1;

  # Prevent npm from trying to update itself
  NO_UPDATE_NOTIFIER = 1;

  # Set npm cache directory to avoid permission issues
  npm_config_cache = ".npm-cache";

  # Configure Bun cache directory
  BUN_INSTALL_CACHE_DIR = ".bun-install-cache";
}

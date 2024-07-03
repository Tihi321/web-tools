use std::{env, path::PathBuf};

use tauri::{App, WebviewUrl, WebviewWindow};

use super::constants::WINDOW_LABEL;

fn get_cache_directory() -> PathBuf {
    let current_directory = env::current_dir().expect("Failed to get current directory");

    current_directory
}

pub fn create_window(app: &App) -> Result<WebviewWindow, tauri::Error> {
    let mut data_directory = get_cache_directory();
    data_directory.push("cache");

    tauri::WebviewWindowBuilder::new(app, WINDOW_LABEL, WebviewUrl::App("index.html".into()))
        .title("Tools".to_string())
        .visible(true)
        .disable_drag_drop_handler()
        .center()
        .data_directory(data_directory)
        .closable(true)
        .resizable(true)
        .decorations(true)
        .inner_size(850.0, 525.0)
        .focused(true)
        .build()
}

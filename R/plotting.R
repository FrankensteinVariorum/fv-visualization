# addition-deletion color scale
scale_edit_composites <- function() {
  list(
    scale_fill_distiller(palette = "RdBu", direction = -1)
  )
}

# ggpage visualization - most-edited apps

app_page_build <- function(app_attributes, ...) {
  un_apps <- app_attributes %>% 
    unnest_tokens(output = text, input = text)
  
  ggpage_build(app_attributes, ...) %>% 
    bind_cols(un_apps) 
}

app_page_plot <- function(app_pages) {
  ggpage_plot(app_pages, aes(fill = log_max_app_edit_distance)) +
    scale_fill_viridis_c(na.value = "#2E0A40")
}

# ggpage visualization - reference comparisons ----

synoptic_app_page_build <- function(ordered_apps, pairwise_app_differences, reference_witness, ...) {
  source_differences <- pairwise_app_differences %>% 
    filter(source == reference_witness)
  
  plot_list <- map(levels(source_differences$target), function(x) {
    target_app_contents <- ordered_apps %>% 
      filter(witness == x)
    
    target_distances <- source_differences %>% 
      filter(target == x)
    
    single_diff_ggpage(target_app_contents, target_distances, ...)
  })
}

single_diff_ggpage <- function(target_app_contents, target_distances, ...) {
  source <- first(target_distances$source)
  target <- first(target_distances$target)
  
  bound_apps <- composite_changes(target_app_contents, target_distances)
  
  unbound_apps <- unnest_tokens(bound_apps, output = word, input = text)
  
  page_layout <- ggpage_build(bound_apps, ...) %>% 
    bind_cols(unbound_apps)
  
  ggpage_plot(page_layout, aes(fill = composite, alpha = magnitude), paper.limits = 0.1) + 
    scale_edit_composites() +
    scale_alpha_continuous(range = c(0.5, 1)) +
    ggtitle(str_glue("{source} -> {target}")) +
    theme(legend.position = "none")
}

heatmap_df <- function(ordered_apps, pairwise_app_differences, source_witness, target_witness) {
  target_contents <- ordered_apps %>% 
    filter(witness == target_witness)
  
  selected_differences <- pairwise_app_differences %>% 
    filter(source == source_witness, target == target_witness)
  
  expanded_content_measures <- composite_changes(target_contents, selected_differences) %>% 
    group_by(app) %>% 
    by_slice(function(x) {
      nreps <- nchar(x$text)
      tibble(
        app_index = seq_len(nreps),
        composite = x$composite,
        magnitude = x$magnitude)
    }, .collate = "rows") %>% 
    arrange(app) %>% 
    mutate(index = row_number()) %>% 
    mutate(source = source_witness, target = target_witness)
}

# non-ggpage heatmap

heatmap_plot <- function(heatmap_df) {
  ggplot(compiled_df, aes(x = source, y = index, fill = composite, alpha = magnitude)) + 
    facet_wrap(~ target, ncol = 1, scales = "free_y") + 
    geom_raster() +
    scale_edit_composites() +
    scale_alpha_continuous(range = c(0.1, 1)) +
    theme_minimal()
}

# tiling ----

tile_generator <- function(df, col_nchar, col_group, col_order = NULL, .width = 500, ...) {
  res <- df %>% 
    by_row(group_expander, col_nchar = col_nchar, .labels = FALSE) %>% 
    pull(.out) %>% 
    bind_rows() %>% 
    mutate(
      .grid_index = row_number(),
      x = .grid_index %% .width,
      y = .grid_index %/% + 1) %>% 
    select(-text)
}

group_expander <- function(x, col_nchar) {
  times <- x[[col_nchar]]
  x[rep(seq_len(nrow(x)), times = times), ]
}

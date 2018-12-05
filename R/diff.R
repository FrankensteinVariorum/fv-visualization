order_apps <- function(full_df) {
  full_df %>% 
    bind_re_match(app, pattern = "^C(?<chunk>\\d{2})(?<subchunk>[a-z])?_app(?<index>\\d+)") %>% 
    as_tibble() %>% 
    mutate(subchunk = coalesce(match(subchunk, letters), 1L)) %>% 
    mutate_at(vars(chunk, index), as.integer) %>% 
    mutate(witness = factor(witness, levels = c("f1818", "f1823", "fThomas", "fMS", "f1831"), ordered = TRUE)) %>% 
    complete(witness, nesting(app, chunk, subchunk, index), fill = list(text = "")) %>%
    arrange(chunk, subchunk, index, witness) %>% 
    mutate(app = factor(app, levels = unique(app), ordered = TRUE))
}

lv_wrapper <- function(x, weight) {
  res <- stringdistmatrix(x, x, method = "lv", weight = weight)
  colnames(res) <- names(x)
  rownames(res) <- names(x)
  
  res %>% 
    as.data.frame() %>% 
    rownames_to_column("source") %>% 
    as_tibble() %>% 
    gather(target, value, -source) %>% 
    mutate_at(vars(source, target), funs(factor(., levels = names(x))))
}

active_weight <- function() 1
inactive_weight <- function() 0.0001

deletions <- function(x) {
  lv_wrapper(x, weight = c(d = active_weight(), 
                           i = inactive_weight(), 
                           s = inactive_weight(), 
                           t = inactive_weight()
  )
  )
}

additions <- function(x) {
  lv_wrapper(x, weight = c(d = inactive_weight(), 
                           i = active_weight(), 
                           s = inactive_weight(), 
                           t = inactive_weight()
  )
  )
}

substitutions <- function(x) {
  lv_wrapper(x, weight = c(d = inactive_weight(), 
                           i = inactive_weight(), 
                           s = active_weight(), 
                           t = inactive_weight()
  )
  )
}

pairwise_app_comparison <- function(ordered_apps, diff_function) {
  witnesses <- levels(ordered_apps$witness)
  
  split_apps <- ordered_apps %>% 
    group_by(app) %>% 
    by_slice(~diff_function(set_names(.$text, .$witness)), .collate = "rows")
  
  witnessed_apps <- split_apps %>% 
    mutate_at(vars(source, target), funs(factor(witnesses[.], levels = witnesses, ordered = TRUE)))
}

app_features <- function(reshaped_spine) {
  reshaped_spine %>% 
    group_by(app_ids) %>% 
    mutate(
      content_char = nchar(content),
      witness_difference = coalesce(stringdist(content, lag(content)))) %>% 
    summarize(
      text = last(content),
      app_length = max(content_char),
      max_app_edit_distance = max(witness_difference, na.rm = TRUE),
      log_max_app_edit_distance = log10(if_else(max_app_edit_distance == 0, NA_real_, max_app_edit_distance))
    )
}

app_page_build <- function(app_attributes, ...) {
  un_apps <- app_attributes %>% 
    unnest_tokens(output = word, input = text)
  
  ggpage_build(un_apps$word, ...) %>% 
    bind_cols(un_apps) 
}

app_page_plot <- function(app_pages) {
  ggpage_plot(app_pages, aes(fill = log_max_app_edit_distance)) +
    scale_fill_viridis_c(na.value = "#2E0A40")
}

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

floorless <- function(x) {
  cutoff <- names(table(x))[2]
  if_else(x <= cutoff, 0, x)
}

composite_changes <- function(contents, distances) {
  contents %>% 
    left_join(distances, by = "app") %>% 
    mutate(transformed_value = rescale(log10(value + 1))) %>% 
    select(-value) %>% 
    spread(edit_type, transformed_value) %>% 
    mutate(composite = char_additions - char_deletions,
           magnitude = char_additions + char_deletions,
           composite = if_else(magnitude == 0, NA_real_, composite))
}

single_diff_ggpage <- function(target_app_contents, target_distances, ...) {
  source <- first(target_distances$source)
  target <- first(target_distances$target)
  
  bound_apps <- composite_changes(target_app_contents, target_distances)
  
  unbound_apps <- unnest_tokens(bound_apps, output = word, input = text)
  
  page_layout <- ggpage_build(bound_apps, ...) %>% 
    bind_cols(unbound_apps)
  
  ggpage_plot(page_layout, aes(fill = composite, alpha = magnitude), paper.limits = 0.1) + 
    scale_fill_gradient2(low = "red", mid = "yellow", high = "green") +
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
      nreps <- wordcount(x$text)
      tibble(
        app_index = seq_len(nreps),
        composite = x$composite,
        magnitude = x$magnitude)
    }, .collate = "rows") %>% 
    arrange(app) %>% 
    mutate(index = row_number()) %>% 
    mutate(source = source_witness, target = target_witness)
}

heatmap_plot <- function(heatmap_df) {
  ggplot(expanded_content_measures, aes(x = 1, y = index, fill = composite, alpha = magnitude)) + 
    geom_raster() +
    scale_fill_gradient2(low = "red", mid = "yellow", high = "green", na.value = "gray30") +
    scale_alpha_continuous(range = c(0.5, 1)) +
    theme_minimal()
  
  
  ggplot(compiled_df, aes(x = source, y = index, fill = composite, alpha = magnitude)) + 
    facet_wrap(~ target, ncol = 1, scales = "free_y") + 
    geom_raster() +
    scale_fill_gradient2(low = "red", mid = "yellow", high = "green", na.value = "gray30") +
    scale_alpha_continuous(range = c(0.1, 1)) +
    theme_minimal()
  
}

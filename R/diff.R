order_apps <- function(full_df) {
  full_df %>% 
    bind_re_match(app_ids, pattern = "^C(?<chunkid>\\d{2})(?<subchunk>[a-z])?_app(?<appid>\\d+)") %>% 
    as_tibble() %>% 
    mutate(subchunk = coalesce(match(subchunk, letters), 1L)) %>% 
    mutate_at(vars(chunkid, appid), as.integer) %>% 
    mutate(witness_id = factor(witness_id, levels = c("f1818", "f1823", "fThomas", "fMS", "f1831"), ordered = TRUE)) %>% 
    complete(witness_id, nesting(app_ids, chunkid, subchunk, appid), fill = list(content = "")) %>%
    arrange(chunkid, subchunk, appid, witness_id)
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

deletions <- function(x) {
  lv_wrapper(x, weight = c(d = 1, i = 0.001, s = 0.0001, t = 0.0001))
}

additions <- function(x) {
  lv_wrapper(x, weight = c(d = 0.0001, i = 1, s = 0.0001, t = 0.0001))
}

substitutions <- function(x) {
  lv_wrapper(x, weight = c(d = 0.0001, i = 0.0001, s = 1, t = 0.0001))
}

pairwise_app_comparison <- function(ordered_apps) {
  split_apps <- ordered_apps %>% 
    split(.$app_ids)
  
  contents <- map(split_apps, function(x) {
    res <- x$content
    set_names(res, x$witness_id)
  })
  
  df_deletions <- map_df(contents, deletions, .id = "app_id")
  df_additions <- map_df(contents, additions, .id = "app_id")
  df_substitutions <- map_df(contents, substitutions, .id = "app_id")

  df_deletions %>% 
    rename("deletions" = value) %>% 
    left_join(rename(df_additions, "additions" = value), by = c("app_id", "source", "target")) %>% 
    left_join(rename(df_substitutions, "substitutions" = value), by = c("app_id", "source", "target"))
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

synoptic_app_page_build <- function(ordered_apps, pariwise_app_differences, reference_witness = "fThomas") {
  source_differences <- pariwise_app_differences %>% 
    filter(source == reference_witness)
}

single_diff_plot <- function(ordered_apps) {
  
}

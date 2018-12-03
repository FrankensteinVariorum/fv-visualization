reshape_spine <- function(raw_spine) {
  raw_spine %>% 
    bind_re_match(app_ids, pattern = "^C(?<chunkid>\\d{2})(?<subchunk>[a-z])?_app(?<appid>\\d+)") %>% 
    as_tibble() %>% 
    mutate(subchunk = coalesce(match(subchunk, letters), 1L)) %>% 
    mutate_at(vars(chunkid, appid), as.integer) %>% 
    mutate(witness_id = factor(witness_id, levels = c("#f1818", "#f1823", "#fThomas", "#f1831"), ordered = TRUE)) %>% 
    arrange(chunkid, subchunk, appid, witness_id)
}

app_features <- function(rehsaped_spine) {
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

app_page_build <- function(app_attributes) {
  un_apps <- app_attributes %>% 
    unnest_tokens(output = word, input = text)
  
  ggpage_build(un_apps$word) %>% 
    bind_cols(un_apps) 
}

app_page_plot <- function(app_pages) {
  ggpage_plot(app_pages, aes(fill = log_max_app_edit_distance))
}
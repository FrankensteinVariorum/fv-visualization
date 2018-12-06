# Tidy raw xml outputs ----

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

# Max edit calculations ----

maximum_app_distance <- function(ordered_apps) {
  ordered_apps %>% 
    group_by(app, chunk, subchunk, index) %>% 
    mutate(
      content_char = nchar(text),
      witness_difference = coalesce(stringdist(text, lag(text)))) %>% 
    summarize(
      text = last(text),
      app_length = max(content_char),
      max_app_edit_distance = max(witness_difference, na.rm = TRUE),
      log_max_app_edit_distance = log10(if_else(max_app_edit_distance == 0, NA_real_, max_app_edit_distance))
    ) %>% 
    ungroup()
}

# Addition/Deletion calculations ----

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

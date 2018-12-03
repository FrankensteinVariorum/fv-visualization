# Collect reading groups from an app
read_one_spine <- function(spinefile) {
  safe_reader <- (get_chunk_table)
  
  spine_names <- path_file(spinefiles)
  res <- spinefiles %>% 
    set_names(spine_names) %>% 
    map(get_chunk_table)
  
  ordered_res <- res %>%
    mutate(
      cid = str_match(app_ids, "C(\\d{2})")[,2] %>% as.integer(),
      subcid = str_match(app_ids, "([a-z])_")[,2] %>% match(letters) %>% as.integer() %>% coalesce(1L),
      aid = str_match(app_ids, "app(\\d+)")[,2] %>% as.integer()
    ) %>% 
    arrange(cid, subcid, aid)
}

get_chunk_table <- function(chunkfile) {
  # get all apps
  apps <- read_xml(chunkfile) %>% 
    xml_ns_strip() %>% 
    xml_find_all(".//app")
  
  app_ids <- apps %>% 
    xml_attr("id")
  
  apps %>% 
    set_names(app_ids) %>% 
    map_df(get_app_tbl, .id = "app_ids")
}

get_app_tbl <- function(app) {
  rdgs <- app %>% 
    xml_find_all('.//rdg') %>% 
    discard(~xml_attr(., "wit") == "#fMS")
  
  rdgs_wit <- rdgs %>%
    xml_attr("wit")
  
  rdgs_content <- map_chr(rdgs, get_rdg_text)
  
  data_frame(
    witness_id = rdgs_wit,
    content = rdgs_content
  )
}

get_rdg_text <- function(rdg) {
  ptrs <- rdg %>% 
    xml_find_all(".//ptr") %>% 
    xml_attr("target")
  
  if (length(ptrs) == 0) return(NA_character_)
  
  map_chr(ptrs, get_ptr_contents) %>% 
    str_c(collapse = " ")
}

get_ptr_contents <- function(ptr) {
  ptr_file <- url_parse(ptr)$path %>%  
    path_file()
  
  ptr_xml_id <- url_parse(ptr)$fragment
  
  rdg_contents <- path("fv-data/edition-chunks/", ptr_file) %>% 
    read_xml() %>% 
    xml_ns_strip() %>% 
    xml_find_first(str_glue(".//seg[@xml:id='{ptr_xml_id}']")) %>% 
    xml_text()
}

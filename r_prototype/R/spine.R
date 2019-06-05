# Cache all referenced edition files
parsed_references <- function(spinefile) {
  read_xml(spinefile) %>% 
    xml_ns_strip() %>% 
    xml_find_all(".//ptr") %>% 
    xml_attr("target") %>% 
    url_parse() %>% 
    filter(str_detect(path, "PghFrankenstein"))
}

# Collect all the text of pointers from a spine file
get_chunk_table <- function(spinefile) {
  # get all apps
  apps <- read_xml(spinefile) %>% 
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
  
  retrieve_pointer_text(ptr, ptr_xml_id)
}

retrieve_pointer_text <- function(xmlfile, pointer_id) {
  if (str_detect(xmlfile, "github")) {
    xmlfile <- path("xmlcache", basename(url_parse(xmlfile)$path))
  }
  
  xmlfile %>% 
    read_xml() %>% 
    xml_find_first(str_glue('.//*[@xml:id="{pointer_id}"]')) %>% 
    xml_text()
}

# Tidy spine outputs

tidy_spine <- function(spine_df) {
  spine_df %>%
    mutate(
      cid = str_match(app_ids, "C(\\d{2})")[,2] %>% as.integer(),
      subcid = str_match(app_ids, "([a-z])_")[,2] %>% match(letters) %>% as.integer() %>% coalesce(1L),
      aid = str_match(app_ids, "app(\\d+)")[,2] %>% as.integer()
    )
}

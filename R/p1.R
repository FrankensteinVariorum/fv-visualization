read_P1 <- function(xmlfile) {
  p1x <- read_xml(xmlfile)
  
  apps <- p1x %>% 
    xml_find_all(".//d1:app") %>% 
    set_names(xml_attr(., "id"))
  
  map_df(apps, harvest_app, .id = "app_ids") 
}

harvest_app <- function(app) {
  readings <- app %>% xml_find_all(".//d1:rdg")
  witness_id <- readings %>% xml_attr("wit")
  content <- readings %>% xml_text() %>% str_replace_all("<.+?>", "")
  
  tibble(witness_id, content)
}

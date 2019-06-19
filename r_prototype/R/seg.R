

process_chunk_file <- function(xmlfile) {
  cxml <- read_xml(xmlfile)
  
  segs <- cxml %>% 
    xml_find_all(".//d1:seg") %>% 
    set_names(xml_attr(., "id"))
  
  text <- segs %>% xml_text() %>% enframe() 
  
  text %>% 
    separate(name, into = c("seg_id", "witness"), sep = "-") %>% 
    mutate(witness = str_replace_all(witness, "__[IMF]", "")) %>% 
    group_by(seg_id, witness) %>% 
    summarize(text = str_c(value, collapse = "")) %>% 
    ungroup()
}

df_pairwise_edits <- function(df) {
  s <- df[["text"]]
  names(s) <- df[["witness"]]
  pairwise_edits(s)
}

pairwise_edits <- function(s) {
  list(
    text_values = enframe(s),
    additions = additions(s) %>% nest(target, value),
    deletions = deletions(s) %>% nest(target, value),
    substitutions = substitutions(s) %>% nest(target, value)
  )
}

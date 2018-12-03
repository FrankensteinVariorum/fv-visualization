# Drake ----

pkgconfig::set_config(
  "drake::strings_in_dots" = "literals",
  "drake::verbose" = 4)

library(drake)
library(tidyverse)
library(xml2)
library(fs)
library(digest)

spine_dir <- "fv-data/standoff_Spine/"

# Load all functions
dir_walk("R", source)

spinefiles <- dir_ls(spine_dir, glob = "*.xml") %>% as.character()

source_references <- map_df(spinefiles, parsed_references)

source_download_url <- source_references %>% distinct(scheme, server, path) %>% str_glue_data("{scheme}://{server}{path}") %>% as.character()
source_download_file <- source_references %>% distinct(path) %>% pull(path) %>% basename() %>% path("xmlcache", .) %>% as.character()

# Cache edition source XML
walk2(source_download_url, source_download_file, ~download_xml(.x, .y))

spine_process_input <- as.character(str_glue("get_chunk_table(file_in(\"{spinefiles}\"))"))

spine_process_list <- tibble(
  target = as.character(path_ext_remove(basename(spinefiles))),
  command = spine_process_input
)

generic_spine_plan <- drake_plan(spine = get_chunk_table(file_in("file__")))
expanded_spine_plan <- evaluate_plan(generic_spine_plan, wildcard = "file__", values = spinefiles)
spine_plan <- gather_plan(expanded_spine_plan, target = "raw_spine", gather = "rbind", append = TRUE)

fv_plan <- bind_plans(
  spine_plan
)

fv_plan

make(fv_plan)


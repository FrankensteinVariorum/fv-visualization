# Drake ----

pkgconfig::set_config(
  "drake::strings_in_dots" = "literals",
  "drake::verbose" = 4)

library(drake)
library(tidyverse)
library(purrrlyr)
library(xml2)
library(fs)
library(rematch2)
library(stringdist)
library(tidytext)
library(ggpage)
library(scales)

# Load all functions
dir_walk("R", source)

# P1 collations ----

collation_dir <- "../fv-postCollation/P1-output/"
collationfiles <- dir_ls(collation_dir, glob = "*.xml")
witnesses <- map(collationfiles, function(x) {
  read_xml(x) %>% xml_find_all(".//d1:rdg") %>% xml_attr("wit")
}) %>% flatten_chr() %>% unique()

fv_plan <- drake_plan(
  full_df = map_df(collationfiles, read_P1),
  ordered_apps = order_apps(full_df),
  pairwise_additions = pairwise_app_comparison(ordered_apps, additions),
  pairwise_deletions = pairwise_app_comparison(ordered_apps, deletions),
  pairwise_app_differences = bind_rows("char_additions" = pairwise_additions,
                               "char_deletions" = pairwise_deletions,
                               .id = "edit_type")
)

witness_plots_generic <- drake_plan(diffplot = synoptic_app_page_build(ordered_apps, pairwise_app_differences, reference_witness = "wit__"))
witness_plots_plan <- evaluate_plan(witness_plots_generic, wildcard = "wit__", values = witnesses)

fv_plan <- bind_plans(
  fv_plan, 
  witness_plots_plan)

make(fv_plan)


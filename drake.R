# Drake ----

pkgconfig::set_config(
  "drake::strings_in_dots" = "literals",
  "drake::verbose" = 4)

library(drake)
library(tidyverse)
library(xml2)
library(fs)
library(rematch2)
library(stringdist)
library(tidytext)
library(ggpage)

# Load all functions
dir_walk("R", source)

# P1 collations ----

collation_dir <- "../fv-postCollation/P1-output/"
collationfiles <- dir_ls(collation_dir, glob = "*.xml")

fv_plan <- drake_plan(
  full_df = map_df(collationfiles, read_P1),
  ordered_apps = order_apps(full_df),
  pariwise_app_differences = pairwise_app_comparison(ordered_apps),
  app_pages = app_page_build(app_attributes, ncol = 1),
  app_page_plot(app_pages)
)

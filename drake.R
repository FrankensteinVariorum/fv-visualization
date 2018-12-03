# Drake ----

pkgconfig::set_config(
  "drake::strings_in_dots" = "literals",
  "drake::verbose" = 4)

library(drake)
library(tidyverse)
library(xml2)
library(fs)

spine_dir <- "fv-data/standoff_Spine/"

# Load all functions
dir_walk("R", source)

spinefiles <- dir_ls(spine_dir, glob = "*.xml")

xml_generic <- drake_plan(od, read_xml(x = file_in(s__)))
xml_plan <- evaluate_plan(xml_generic, rules = list(s__ = spinefiles))

fv_plan <- drake_plan(
  
)

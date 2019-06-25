import json

with open("raw_data.json") as ddd:
  coll_list = json.load(ddd)

output = {"data": []}

change_indicies = []
nchar_values = []

for obj in coll_list:
  witness = {"seg": obj["seg_id"]}
  for wit in obj[".out"]["text_values"]:
    nchar = len(wit["value"])
    nchar_values.append(nchar)
    witness[wit["name"]] = {
      "text": {
        "content": wit["value"],
        "nchar": nchar
      }
    }

  for diff in obj[".out"]["additions"]:
    diff_data = {}
    for target in diff["data"]:
      if target["value"] == 0:
        val = None
      else:
        val = target["value"]
      diff_data[target["target"]] = val
      change_indicies.append(val)
    witness[diff["source"]]["additions"] = diff_data

  for diff in obj[".out"]["deletions"]:
    diff_data = {}
    for target in diff["data"]:
      diff_data[target["target"]] = target["value"]
      change_indicies.append(target["value"])
    witness[diff["source"]]["deletions"] = diff_data

  for diff in obj[".out"]["substitutions"]:
    diff_data = {}
    for target in diff["data"]:
      diff_data[target["target"]] = target["value"]
      change_indicies.append(target["value"])
    witness[diff["source"]]["substitutions"] = diff_data

  output["data"].append(witness)

output["range"] = {"min": min(change_indicies), "max": max(change_indicies)}
output["nchars"] = {"min": min(nchar_values), "max": max(nchar_values)}

with open("data.json", "w") as wf:
  json.dump(output, wf, indent=2)
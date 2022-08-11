// @ts-ignore
import directory, {
  get_path_from_root,
  get_parent_path_from_root,
} from "../types/directory";
// @ts-ignore
import message from "../types/message.ts";
// @ts-ignore
import return_status from "../types/return_status.ts";
// @ts-ignore
import hasher from "./hash.ts";
// @ts-ignore
import {
  write_file,
  write_keys,
  write_messages,
  read_messages,
} from "../services/database";
import { stringify, parse } from "circular-json";
import { uid } from "uid";
import Fuse from "fuse.js";
import global_variables from "../globals/global_variables";

// passive
export function get_directory_by_name(
  dictionary: Map<number, directory>,
  path: string
): directory {
  let h: number = hasher.hash(path);
  // @ts-ignore
  return dictionary.get(h);
}

// passive
export function get_directory_path(directory: directory): string {
  return get_path_from_root(directory);
}

// passive
export function get_all_directory_names(
  dictionary: Map<number, directory>
): string[] {
  let directory_names: string[] = [];
  for (let [key, value] of dictionary.entries()) {
    directory_names.push(get_path_from_root(value));
  }
  return directory_names;
}

// modifiying
export function create_root(dictionary: Map<number, directory>): return_status {
  let root: directory = {
    parent_directory: "",
    sub_directories: [],
    name: "root",
    messages: [],
    type: "directory",
    search_result: false,
    id: uid(32),
  };
  let hash_value: number = hasher.hash(root);
  if (dictionary.has(hash_value)) {
    return { map: dictionary, status: false, message: "Root already exists" };
  }
  dictionary.set(hash_value, root);
  write_file(dictionary);
  write_messages([]);
  return { map: dictionary, status: true, message: "Root created" };
}

// modifying
export function add_directory(
  dictionary: Map<number, directory>,
  parent_directory_path: string,
  name: string
): return_status {
  let parent_directory = get_directory_by_name(
    dictionary,
    parent_directory_path
  );
  let add: directory = {
    parent_directory: parent_directory_path,
    sub_directories: [],
    name: name.trim(),
    messages: [],
    type: "directory",
    search_result: false,
    id: uid(32),
  };

  let hash_value: number = hasher.hash(add);
  if (dictionary.has(hash_value)) {
    return {
      map: dictionary,
      status: false,
      message: "Directory path already exists",
    };
  }
  // set the subdirectory of the parent to the new directory
  parent_directory.sub_directories.push(get_path_from_root(add));
  dictionary = dictionary.set(hash_value, add);
  // update parent too
  dictionary = dictionary.set(hasher.hash(parent_directory), parent_directory);
  write_file(dictionary);
  let messages_search = get_all_messages_global_searchable(dictionary);
  write_messages(messages_search);
  return { map: dictionary, status: true, message: "Success" };
}

// modifying
export function add_message(
  dictionary: Map<number, directory>,
  directory_path: string,
  comserver: string = "",
  scripts: string[] = [],
  description: string = "",
  raw_message: string,
  notes: string = ""
): return_status {
  // check if directory exists
  let directory: directory = get_directory_by_name(dictionary, directory_path);

  let hash_value_directory: number = hasher.hash(directory);

  if (!dictionary.has(hash_value_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "attempting to add into an invalid directory!",
    };
  }
  let directory_copy = parse(stringify(directory));

  let path: string = get_path_from_root(directory_copy);
  let message_to_add: message = {
    raw_message: raw_message.trim(),
    comserver: comserver.trim(),
    description: description.trim(),
    scripts: scripts.map((elm) => {
      return elm.trim();
    }),
    directory_path: path.trim(),
    type: "message",
    notes: notes,
    id: uid(36),
  };
  // check if this message exists in this instance of the map

  if (
    directory_copy.messages.filter(
      (m) => m.description === message_to_add.description
    ).length > 0
  ) {
    return {
      map: dictionary,
      status: false,
      message: "value already exists in this directory!",
    };
  }

  // add the message to the directory
  // @ts-ignore
  dictionary.get(hash_value_directory).messages.push(message_to_add);
  write_file(dictionary);
  let messages_search = get_all_messages_global_searchable(dictionary);
  write_messages(messages_search);
  return {
    map: dictionary,
    status: true,
    message: "value has been added into the directory!",
  };
}

// modifying
export function remove_directory(
  dictionary: Map<number, directory>,
  directory_string: string
): return_status {
  let directory: directory = get_directory_by_name(
    dictionary,
    directory_string
  );
  let parent: directory = get_directory_by_name(
    dictionary,
    get_parent_path_from_root(directory)
  );
  let hash_value_directory: number = hasher.hash(directory);
  if (!dictionary.has(hash_value_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "directory doesn't exist!",
    };
  }
  // deletion needs to occur downstream so first find out all directories to delete and remove from map
  let search_queue = [get_path_from_root(directory)];
  let visited = new Map<string, boolean>();
  while (search_queue.length > 0) {
    let curr_node = search_queue.pop();
    // @ts-ignore
    let curr_node_dir = get_directory_by_name(dictionary, curr_node);
    // @ts-ignore
    visited.set(curr_node, true);
    for (let i = 0; i < curr_node_dir.sub_directories.length; i++) {
      if (visited.has(curr_node_dir.sub_directories[i])) {
        continue;
      }
      search_queue.push(curr_node_dir.sub_directories[i]);
    }
  }
  // remove all directories we have visited
  // remove from parents sub directories list
  for (let [key, value] of visited) {
    let hash_key = hasher.hash(key);
    // @ts-ignore
    dictionary.get(hash_key).messages = [];
    dictionary.delete(hash_key);
  }
  let directory_index: number = parent.sub_directories.indexOf(
    get_path_from_root(directory)
  );
  parent.sub_directories.splice(directory_index, 1);
  dictionary.set(hasher.hash(parent), parent);
  write_file(dictionary);
  let messages_search = get_all_messages_global_searchable(dictionary);
  write_messages(messages_search);
  return {
    map: dictionary,
    status: true,
    message: "directory has been removed!",
  };
}

// modifying
export function remove_message(
  dictionary: Map<number, directory>,
  message: message
): return_status {
  let directory: directory = get_directory_by_name(
    dictionary,
    message.directory_path
  );
  let hash_value_directory: number = hasher.hash(directory);
  if (!dictionary.has(hash_value_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "directory doesn't exist!",
    };
  }

  let new_messages = [];
  let found = false;
  console.log(message, " - ", directory.messages);
  for (let i = 0; i < directory.messages.length; i++) {
    if (
      directory.messages[i].comserver === message.comserver &&
      directory.messages[i].description === message.description &&
      JSON.stringify(directory.messages[i].scripts) ===
        JSON.stringify(message.scripts) &&
      directory.messages[i].raw_message === message.raw_message
    ) {
      found = true;
      continue;
    }
    // @ts-ignore
    new_messages.push(directory.messages[i]);
  }
  if (!found) {
    return {
      map: dictionary,
      status: false,
      message:
        "message you are trying to delete doesn't exist in the directory!",
    };
  }
  // remove old unmodified message
  directory.messages = [...new_messages];
  dictionary.set(hash_value_directory, directory);

  write_file(dictionary);
  let messages_search = get_all_messages_global_searchable(dictionary);
  write_messages(messages_search);
  return {
    map: dictionary,
    status: true,
    message: "message was deleted from the directory!",
  };
}

// modifying
export function modify_directory(
  dictionary: Map<number, directory>,
  directory_path: string,
  name: string
): return_status {
  let directory: directory = get_directory_by_name(dictionary, directory_path);
  let parent: directory = get_directory_by_name(
    dictionary,
    get_parent_path_from_root(directory)
  );
  const old_path = get_path_from_root(directory);
  let hash_value_directory: number = hasher.hash(directory);
  if (!dictionary.has(hash_value_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "Directory doesn't exist!",
    };
  }
  let hash_value_parent: number = hasher.hash(parent);
  directory.name = name;
  let new_value_hash: number = hasher.hash(directory);
  const new_path = get_path_from_root(directory);
  if (dictionary.has(new_value_hash)) {
    return {
      map: dictionary,
      status: false,
      message: "Name you are changing to already exists!",
    };
  }
  // since we are modifying (all dirs have only 1 parent we want to update the parents sub_directory list)
  let new_subs: string[] = [];
  for (let i = 0; i < parent.sub_directories.length; i++) {
    if (
      !dictionary.has(hasher.hash(parent.sub_directories[i])) ||
      hasher.hash(parent.sub_directories[i]) === hash_value_directory
    ) {
      continue;
    }
    // @ts-ignore
    new_subs.push(parent.sub_directories[i]);
  }
  // @ts-ignore
  new_subs.push(get_path_from_root(directory));

  parent.sub_directories = new_subs;
  dictionary.set(hash_value_parent, parent);

  // fix all subdirectories downstream from CURRENT directory
  let search_queue = [old_path];
  let visited = new Map<string, boolean>();
  while (search_queue.length > 0) {
    let curr_node = search_queue.pop();
    // @ts-ignore
    let curr_node_dir = get_directory_by_name(dictionary, curr_node);
    let curr_node_dir_hash = hasher.hash(curr_node_dir);
    curr_node_dir.parent_directory = curr_node_dir.parent_directory.replace(
      old_path,
      new_path
    );
    // fix the messages path
    for (let i = 0; i < curr_node_dir.messages.length; i++) {
      curr_node_dir.messages[i].directory_path = curr_node_dir.messages[
        i
      ].directory_path.replace(old_path, new_path);
    }
    // @ts-ignore
    visited.set(curr_node, true);
    for (let i = 0; i < curr_node_dir.sub_directories.length; i++) {
      if (visited.has(curr_node_dir.sub_directories[i])) {
        continue;
      }
      search_queue.push(curr_node_dir.sub_directories[i]);
    }
    // fix subs
    for (let i = 0; i < curr_node_dir.sub_directories.length; i++) {
      curr_node_dir.sub_directories[i] = curr_node_dir.sub_directories[
        i
      ].replace(old_path, new_path);
    }
    // recompute hash for the curr_node_dir since its changed parent
    dictionary.delete(curr_node_dir_hash);
    dictionary.set(hasher.hash(curr_node_dir), curr_node_dir);
  }

  dictionary.delete(hash_value_directory);
  dictionary.set(new_value_hash, directory);

  write_file(dictionary);
  let messages_search = get_all_messages_global_searchable(dictionary);
  write_messages(messages_search);
  return {
    map: dictionary,
    status: true,
    message: "changed name successfully!",
  };
}

// modifying
export function modify_message(
  dictionary: Map<number, directory>,
  message: message,
  raw_message: string = "",
  comserver: string = "",
  scripts: string[] = [],
  description: string = "",
  notes: string = ""
): return_status {
  let message_copy: message = parse(stringify(message));
  let directory: directory = parse(
    stringify(get_directory_by_name(dictionary, message_copy.directory_path))
  );
  let hash_value_directory: number = hasher.hash(directory);
  if (description === "") {
    return {
      map: dictionary,
      status: false,
      message: "name field must be populated!",
    };
  }
  if (!dictionary.has(hash_value_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "directory doesn't exist!",
    };
  }
  // try retrieve this message
  let new_messages = [];
  let found = false;
  for (let i = 0; i < directory.messages.length; i++) {
    if (
      directory.messages[i].comserver === message.comserver &&
      directory.messages[i].description === message.description &&
      JSON.stringify(directory.messages[i].scripts) ===
        JSON.stringify(message.scripts) &&
      directory.messages[i].raw_message === message.raw_message &&
      directory.messages[i].notes === message.notes
    ) {
      found = true;
      continue;
    }
    if (directory.messages[i].description === description) {
      return {
        map: dictionary,
        status: false,
        message: "Cannot rename to exisiting directory name!",
      };
    }
    // @ts-ignore
    new_messages.push(directory.messages[i]);
  }
  if (!found) {
    return {
      map: dictionary,
      status: false,
      message:
        "message you are trying to modify doesn't exist in the directory!",
    };
  }
  // remove old unmodified message
  directory.messages = [...new_messages];
  message_copy.comserver = comserver;
  message_copy.raw_message = raw_message;
  message_copy.scripts = scripts;
  message_copy.notes = notes;
  message_copy.description = description;
  message_copy.id = message.id;
  directory.messages.push(message_copy);
  dictionary.set(hash_value_directory, directory);
  write_file(dictionary);
  let messages_search = get_all_messages_global_searchable(dictionary);
  write_messages(messages_search);
  return {
    map: dictionary,
    status: true,
    message: "message has been modified!",
  };
}

// modifying
export function search(
  dictionary: Map<number, directory>,
  search_query: string,
  parent_directory: string
): return_status {
  // step 1 need to get all messages
  let search_dir: directory = {
    parent_directory: parent_directory,
    sub_directories: [],
    name: "Search Results",
    messages: [],
    type: "directory",
    id: uid(32),
    search_result: true,
  };

  let hash_value: number = hasher.hash(search_dir);
  // @ts-ignore
  let all_messages = JSON.parse(read_messages());
  let item_results = search_messages(all_messages, search_query);
  console.log(item_results);
  // step 3 create new "Search Result Directory"
  search_dir.messages = item_results;
  console.log(search_dir);
  dictionary.set(hash_value, search_dir);

  return {
    map: dictionary,
    status: true,
    message: "search returned!",
  };
}

// modifying
export function search_filtered(
  dictionary: Map<number, directory>,
  search_query: string,
  comserver: string[],
  scripts: string[],
  parent_directory: string,
  project: string
): return_status {
  if (comserver.length === 0 && scripts.length === 0 && project === "") {
    return search(dictionary, search_query, parent_directory);
  }
  let search_dir: directory = {
    parent_directory: parent_directory,
    sub_directories: [],
    name: "Search Results",
    messages: [],
    type: "directory",
    id: uid(32),
    search_result: true,
  };

  let hash_value: number = hasher.hash(search_dir);
  // @ts-ignore
  let all_messages = JSON.parse(read_messages());
  // filter all messages
  let filtered_messages_map: Map<string, any> = new Map<string, any>();
  let flag: boolean = false;
  if (comserver.length === 0 && scripts.length === 0) {
    flag = true;
  }

  for (let i = 0; i < all_messages.length; i++) {
    if (
      project !== "" &&
      !all_messages[i].directory_path.trim().startsWith(project)
    ) {
      continue;
    }
    if (flag) {
      filtered_messages_map.set(all_messages[i].id, all_messages[i]);
      continue;
    }
    // go through each script/directory in filter to do this
    for (let j = 0; j < comserver.length; j++) {
      if (comserver[j].trim() === all_messages[i].comserver.trim()) {
        filtered_messages_map.set(all_messages[i].id, all_messages[i]);
        break;
      }
    }
    for (let j = 0; j < scripts.length; j++) {
      if (all_messages[i].scripts.indexOf(scripts[j].trim()) !== -1) {
        filtered_messages_map.set(all_messages[i].id, all_messages[i]);
        break;
      }
    }
  }
  let filtered_messages = [];
  for (let [key, value] of filtered_messages_map) {
    // @ts-ignore
    filtered_messages.push(value);
  }
  console.log(filtered_messages);

  let item_results = search_messages(filtered_messages, search_query);
  console.log(item_results);
  // step 3 create new "Search Result Directory"
  search_dir.messages = item_results;
  console.log(search_dir);
  dictionary.set(hash_value, search_dir);

  return {
    map: dictionary,
    status: true,
    message: "search returned!",
  };
}

// passive
export function get_all_messages(
  dictionary: Map<number, directory>,
  directory: directory
): message[] {
  let hash_value_directory: number = hasher.hash(directory);
  if (!dictionary.has(hash_value_directory)) {
    return [];
  }
  return directory.messages;
}

// passive
export function get_all_directories_from_current(
  dictionary: Map<number, directory>,
  name: string
): directory[] {
  let hash_value_directory: number = hasher.hash(name);
  if (!dictionary.has(hash_value_directory)) {
    return [];
  }
  let all_dirs_from_current: directory[] = [];
  // @ts-ignore
  let subs = dictionary.get(hash_value_directory).sub_directories;
  for (let i = 0; i < subs.length; i++) {
    all_dirs_from_current.push(get_directory_by_name(dictionary, subs[i]));
  }
  return all_dirs_from_current;
}

// add uids only need to ever do this once and now
export function add_uids_to_everything(dictionary: Map<number, directory>) {
  for (let [key, value] of dictionary) {
    let entry_copy: directory = parse(stringify(value));
    entry_copy.id = uid(32);

    for (let i = 0; i < entry_copy.messages.length; i++) {
      entry_copy.messages[i].id = uid(32);
    }
    dictionary.set(key, entry_copy);
  }

  write_file(dictionary);
  return {
    map: dictionary,
    status: true,
    message: "message has been modified!",
  };
}

// passive
export function map_scripts_to_comserver(
  dictionary: Map<number, directory>,
  project: string
): Map<string, string[]> {
  let ret: Map<string, string[]> = new Map<string, string[]>();
  for (let [key, value] of dictionary) {
    for (let i = 0; i < value.messages.length; i++) {
      if (
        project !== "" &&
        !value.messages[i].directory_path.trim().startsWith("root/" + project)
      ) {
        continue;
      }
      for (let j = 0; j < value.messages[i].scripts.length; j++) {
        if (value.messages[i].scripts[j].trim() === "") {
          continue;
        }
        if (ret.has(value.messages[i].scripts[j].trim())) {
          let new_vals = ret.get(value.messages[i].scripts[j].trim());
          if (new_vals?.indexOf(value.messages[i].comserver.trim()) === -1) {
            new_vals.push(value.messages[i].comserver.trim());
            ret.set(value.messages[i].scripts[j].trim(), new_vals);
          }
        } else {
          ret.set(value.messages[i].scripts[j].trim(), [
            value.messages[i].comserver.trim(),
          ]);
        }
      }
    }
  }
  return ret;
}

// passive
export function map_comserver_to_scripts(
  dictionary: Map<number, directory>,
  project: string
): Map<string, string[]> {
  let ret: Map<string, string[]> = new Map<string, string[]>();
  for (let [key, value] of dictionary) {
    for (let i = 0; i < value.messages.length; i++) {
      if (
        project !== "" &&
        !value.messages[i].directory_path.trim().startsWith("root/" + project)
      ) {
        continue;
      }
      if (value.messages[i].comserver.trim() === "") {
        continue;
      }
      if (ret.has(value.messages[i].comserver.trim())) {
        let new_vals = ret.get(value.messages[i].comserver.trim());
        for (let j = 0; j < value.messages[i].scripts.length; j++) {
          if (
            value.messages[i].scripts[j].trim() === "" ||
            // @ts-ignore
            new_vals.indexOf(value.messages[i].scripts[j].trim()) !== -1
          ) {
            continue;
          }
          new_vals?.push(value.messages[i].scripts[j].trim());
        }
        // @ts-ignore
        ret.set(value.messages[i].comserver.trim(), new_vals);
      } else {
        let new_vals = [];
        for (let j = 0; j < value.messages[i].scripts.length; j++) {
          if (
            value.messages[i].scripts[j].trim() === "" ||
            // @ts-ignore
            new_vals.indexOf(value.messages[i].scripts[j].trim()) !== -1
          ) {
            continue;
          }
          // @ts-ignore
          new_vals?.push(value.messages[i].scripts[j].trim());
        }
        ret.set(value.messages[i].comserver.trim(), new_vals);
      }
    }
  }
  return ret;
}

// passive
export function map_project_to_script_comserver(
  dictionary: Map<number, directory>
): Map<string, any> {
  // we want to compute the above maps on a per project basis!
  // step 1 get all children of root
  let ret: Map<string, any> = new Map<string, any>();
  let root = get_directory_by_name(dictionary, "root");
  let projects = root.sub_directories;
  projects.push("");
  for (let i = 0; i < projects.length; i++) {
    let maps = {
      scripts_comserver_map: map_scripts_to_comserver(
        dictionary,
        projects[i].replace("root/", "")
      ),
      comserver_scripts_map: map_comserver_to_scripts(
        dictionary,
        projects[i].replace("root/", "")
      ),
    };
    ret.set(projects[i], maps);
  }
  write_keys(global_variables.project_map, JSON.stringify(ret, replacer));
  console.log(ret);
  return ret;
}

// passive
export function get_all_messages_global_searchable(
  dictionary: Map<number, directory>
): message[] {
  let all_messages: message[] = [];
  console.log("HI");
  for (let [key, value] of dictionary) {
    if (value.search_result !== undefined && value.search_result !== true)
      all_messages.push(...value.messages);
  }
  all_messages = all_messages.map((elm) => ({
    ...elm,
    combined_keys:
      elm.raw_message +
      " " +
      elm.notes +
      " " +
      elm.scripts.toString() +
      " " +
      elm.comserver +
      " " +
      elm.description,
  }));
  console.log(all_messages);
  return all_messages;
}

// modifying
export function fix_directories(
  dictionary: Map<number, directory>
): Map<number, directory> {
  for (let [key, value] of dictionary) {
    let new_val = value;
    new_val.search_result = false;
    dictionary.set(key, new_val);
  }
  return dictionary;
}

export function move_message(
  dictionary: Map<number, directory>,
  message: message,
  target: string
): return_status {
  // step 1 find it
  let current_directory: directory = get_directory_by_name(
    dictionary,
    message.directory_path
  );
  let hash_value_current_directory: number = hasher.hash(current_directory);
  if (!dictionary.has(hash_value_current_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "Source directory doesn't exist!",
    };
  }
  let target_directory: directory = get_directory_by_name(dictionary, target);
  let hash_value_target_directory: number = hasher.hash(target_directory);
  if (!dictionary.has(hash_value_target_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "Target directory doesn't exist!",
    };
  }

  // step 2 add it to target directory
  let search = target_directory.messages.filter((item) => {
    return item.description === message.description;
  });
  let old_message_description = message.description;
  let count = 1;
  while (search.length !== 0) {
    message.description =
      old_message_description + " (" + count.toString() + ")";
    count++;
    search = target_directory.messages.filter((item) => {
      return item.description === message.description;
    });
  }
  message.directory_path = target;
  target_directory.messages.push(message);
  // step 3 delete it from current directory
  current_directory.messages = current_directory.messages.filter((item) => {
    return item.id !== message.id && item.description !== message.description;
  });
  // step 4 update maps
  dictionary.set(hash_value_target_directory, target_directory);
  dictionary.set(hash_value_current_directory, current_directory);
  write_file(dictionary);
  let messages_search = get_all_messages_global_searchable(dictionary);
  write_messages(messages_search);
  return {
    map: dictionary,
    status: true,
    message: "message was moved to " + target + "!",
  };
}

// step 0 check target directory, retrieve see if it exists
// step 1 compute hash of current directory, check if it exists
// step 2 check subdirectories of target if they have a directory with name ending path same, append (1) to it if it does
// step 3 add to subdirectory of target
// step 4 remove as subdirectory of current parent
// step 5 downstream renaming to match new destination
// step 6 fix map to remove previous hash of old directory and replace with new hash of current directory
// modifying
export function move_directory(
  dictionary: Map<number, directory>,
  directory: directory,
  target: string
): return_status {
  let target_directory: directory = get_directory_by_name(dictionary, target);
  let hash_value_target_directory: number = hasher.hash(target_directory);
  if (!dictionary.has(hash_value_target_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "Target directory doesn't exist!",
    };
  }
  let hash_value_moving_directory: number = hasher.hash(directory);
  if (!dictionary.has(hash_value_target_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "Directory you are moving doesn't exist!",
    };
  }

  let current_directory: directory = get_directory_by_name(
    dictionary,
    directory.parent_directory
  );
  let hash_value_current_directory: number = hasher.hash(
    directory.parent_directory
  );
  if (!dictionary.has(hash_value_target_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "Current directory doesn't exist!",
    };
  }
  // step 2 check the ends of each subidrectory with the NAME of moving directory
  let search = target_directory.sub_directories.filter((item) => {
    let split = item.split("/");
    return split[split.length - 1] === directory.name;
  });
  let adding_string = "";
  let count = 1;
  console.log("length", search.length);
  while (search.length !== 0) {
    console.log(adding_string);
    adding_string = " (" + count + ")";
    count++;
    search = target_directory.sub_directories.filter((item) => {
      let split = item.split("/");
      return split[split.length - 1] === directory.name + adding_string;
    });
  }
  let old_path = directory.parent_directory + "/" + directory.name;
  // step 4
  current_directory.sub_directories = current_directory.sub_directories.filter(
    (item) => {
      let split = item.split("/");
      return split[split.length - 1] !== directory.name;
    }
  );

  directory.name += adding_string;

  // step 3
  let insert =
    target_directory.parent_directory !== ""
      ? target_directory.parent_directory +
        "/" +
        target_directory.name +
        "/" +
        directory.name
      : target_directory.name + "/" + directory.name;
  target_directory.sub_directories.push(insert);
  let new_path =
    target_directory.parent_directory !== ""
      ? target_directory.parent_directory +
        "/" +
        target_directory.name +
        "/" +
        directory.name
      : target_directory.name + "/" + directory.name;
  console.log(old_path, " -> ", new_path);
  let first = true;
  // fix all subdirectories downstream from CURRENT directory
  let search_queue = [old_path];
  let visited = new Map<string, boolean>();

  while (search_queue.length > 0) {
    console.log(search_queue);
    let curr_node = search_queue.pop();
    // @ts-ignore
    let curr_node_dir = get_directory_by_name(dictionary, curr_node);
    let curr_node_dir_hash = hasher.hash(curr_node_dir);
    console.log(
      "PARENT_DIRECTORY:",
      curr_node_dir.parent_directory,
      "\nOLD_PATH:",
      old_path,
      "\nNEW_PATH:",
      new_path
    );
    if (!first) {
      curr_node_dir.parent_directory = curr_node_dir.parent_directory.replace(
        old_path,
        new_path
      );
    } else {
      curr_node_dir.parent_directory = curr_node_dir.parent_directory.replace(
        old_path.split("/").slice(0, -1).join("/"),
        new_path.split("/").slice(0, -1).join("/")
      );
      if (curr_node_dir.id === directory.id) {
        curr_node_dir.name = directory.name;
      }
      first = false;
    }
    console.log("NEW PARENT_DIRECTORY:", curr_node_dir.parent_directory);
    // fix the messages path
    for (let i = 0; i < curr_node_dir.messages.length; i++) {
      curr_node_dir.messages[i].directory_path = curr_node_dir.messages[
        i
      ].directory_path.replace(old_path, new_path);
    }
    // @ts-ignore
    visited.set(curr_node, true);
    for (let i = 0; i < curr_node_dir.sub_directories.length; i++) {
      if (visited.has(curr_node_dir.sub_directories[i])) {
        continue;
      }
      search_queue.push(curr_node_dir.sub_directories[i]);
    }
    // fix subs
    for (let i = 0; i < curr_node_dir.sub_directories.length; i++) {
      console.log(
        curr_node_dir.sub_directories[i],
        "old path: ",
        old_path,
        "new_path:",
        new_path
      );
      curr_node_dir.sub_directories[i] = curr_node_dir.sub_directories[
        i
      ].replace(old_path, new_path);
    }
    console.log(curr_node_dir);
    // recompute hash for the curr_node_dir since its changed parent
    dictionary.delete(curr_node_dir_hash);
    dictionary.set(hasher.hash(curr_node_dir), curr_node_dir);
  }
  // directory.parent_directory = new_parent;
  dictionary.delete(hash_value_moving_directory);
  dictionary.set(hash_value_current_directory, current_directory);
  dictionary.set(hash_value_target_directory, target_directory);
  write_file(dictionary);
  let messages_search = get_all_messages_global_searchable(dictionary);
  write_messages(messages_search);
  return {
    map: dictionary,
    status: true,
    message: "directory was moved to + " + target + "!",
  };
}

export function copy_message(message: message) {
  // copy to clipboard the message
  console.log(message);
  localStorage.setItem(global_variables.clipboard, JSON.stringify(message));
}

export function copy_directory(directory: directory) {
  localStorage.setItem(global_variables.clipboard, JSON.stringify(directory));
}

export function paste_general(
  dictionary: Map<number, directory>
): return_status {
  let paste_object_string = window.localStorage.getItem(
    global_variables.clipboard
  );
  if (
    paste_object_string !== undefined &&
    paste_object_string !== null &&
    paste_object_string !== ""
  ) {
    let paste_object = JSON.parse(paste_object_string);
    if (paste_object.type === "message") {
      return paste_message(dictionary, paste_object);
    } else {
      return paste_directory(dictionary, paste_object);
    }
  } else {
    return {
      map: dictionary,
      status: false,
      message: "Nothing in clipboard!",
    };
  }
}

export function paste_message(
  dictionary: Map<number, directory>,
  message: message
): return_status {
  let current_directory_string = window.localStorage.getItem(
    global_variables.current_directory
  );
  if (
    current_directory_string === null ||
    current_directory_string === undefined
  ) {
    current_directory_string = "";
  }

  let current_directory: directory = get_directory_by_name(
    dictionary,
    current_directory_string
  );
  let hash_value_current_directory = hasher.hash(current_directory);
  if (!dictionary.has(hash_value_current_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "Current directory not found!",
    };
  }
  let copy_message = JSON.parse(JSON.stringify(message));

  let search = current_directory.messages.filter((item) => {
    return item.description === copy_message.description;
  });
  let old_message_description = copy_message.description;
  let count = 1;
  while (search.length !== 0) {
    console.log(search.length);
    copy_message.description =
      old_message_description + " (" + count.toString() + ")";
    console.log(copy_message.description);
    count++;
    search = current_directory.messages.filter((item) => {
      return item.description === copy_message.description;
    });
  }

  copy_message.directory_path = current_directory_string;
  copy_message.id = uid(16);
  current_directory.messages.push(copy_message);
  // step 4 update maps
  dictionary.set(hash_value_current_directory, current_directory);
  write_file(dictionary);
  let messages_search = get_all_messages_global_searchable(dictionary);
  write_messages(messages_search);
  return {
    map: dictionary,
    status: true,
    message: "message Pasted!",
  };
}

export function paste_directory(
  dictionary: Map<number, directory>,
  directory: directory
): return_status {
  let current_directory_string = window.localStorage.getItem(
    global_variables.current_directory
  );
  if (
    current_directory_string === null ||
    current_directory_string === undefined
  ) {
    current_directory_string = "";
  }

  let current_directory: directory = get_directory_by_name(
    dictionary,
    current_directory_string
  );
  let hash_value_current_directory = hasher.hash(current_directory);
  if (!dictionary.has(hash_value_current_directory)) {
    return {
      map: dictionary,
      status: false,
      message: "Current directory not found!",
    };
  }

  // cancer
  let copy_directory = JSON.parse(JSON.stringify(directory));
  copy_directory.id = uid(16);
  let search = current_directory.sub_directories.filter((item) => {
    let split = item.split("/");
    return split[split.length - 1] === copy_directory.name;
  });
  let adding_string = "";
  let count = 1;
  console.log("length", search.length);
  while (search.length !== 0) {
    console.log(adding_string);
    adding_string = " (" + count + ")";
    count++;
    search = current_directory.sub_directories.filter((item) => {
      let split = item.split("/");
      return split[split.length - 1] === copy_directory.name + adding_string;
    });
  }
  let old_path = copy_directory.parent_directory + "/" + copy_directory.name;

  copy_directory.name += adding_string;
  // step 3
  let insert =
    current_directory.parent_directory !== ""
      ? current_directory.parent_directory +
        "/" +
        current_directory.name +
        "/" +
        copy_directory.name
      : current_directory.name + "/" + copy_directory.name;
  current_directory.sub_directories.push(insert);
  let new_path =
    current_directory.parent_directory !== ""
      ? current_directory.parent_directory +
        "/" +
        current_directory.name +
        "/" +
        copy_directory.name
      : current_directory.name + "/" + copy_directory.name;
  console.log(old_path, " -> ", new_path);
  let first = true;
  // fix all subdirectories downstream from CURRENT directory
  let search_queue = [old_path];
  let visited = new Map<string, boolean>();
  while (search_queue.length > 0) {
    console.log(search_queue);
    let curr_node = search_queue.pop();
    // @ts-ignore
    let curr_node_dir = get_directory_by_name(dictionary, curr_node);
    console.log(
      "PARENT_DIRECTORY:",
      curr_node_dir.parent_directory,
      "\nNAME:",
      curr_node_dir.name,
      "\nOLD_PATH:",
      old_path,
      "\nNEW_PATH:",
      new_path
    );

    curr_node_dir.parent_directory = curr_node_dir.parent_directory.replace(
      old_path.split("/").slice(0, -1).join("/"),
      new_path.split("/").slice(0, -1).join("/")
    );

    console.log(
      "CHANGED PARENT_DIRECTORY:",
      curr_node_dir.parent_directory,
      "\nCHANGED NAME:",
      curr_node_dir.name
    );
    // fix the messages path
    for (let i = 0; i < curr_node_dir.messages.length; i++) {
      curr_node_dir.messages[i].directory_path = curr_node_dir.messages[
        i
      ].directory_path.replace(old_path, new_path);
      curr_node_dir.messages[i].id = uid(16);
    }
    // @ts-ignore
    visited.set(curr_node, true);
    for (let i = 0; i < curr_node_dir.sub_directories.length; i++) {
      if (visited.has(curr_node_dir.sub_directories[i])) {
        continue;
      }
      search_queue.push(curr_node_dir.sub_directories[i]);
    }
    // fix subs
    for (let i = 0; i < curr_node_dir.sub_directories.length; i++) {
      console.log(curr_node_dir);
      console.log(curr_node_dir.sub_directories[i]);
      curr_node_dir.sub_directories[i] = curr_node_dir.sub_directories[
        i
      ].replace(old_path, new_path);
      console.log(curr_node_dir.sub_directories[i]);
    }
    // recompute hash for the curr_node_dir since its changed parent
    dictionary.set(hasher.hash(curr_node_dir), curr_node_dir);
  }
  // directory.parent_directory = new_parent;
  dictionary.set(hash_value_current_directory, current_directory);
  dictionary.set(hasher.hash(copy_directory), copy_directory);
  write_file(dictionary);
  let messages_search = get_all_messages_global_searchable(dictionary);
  write_messages(messages_search);
  return {
    map: dictionary,
    status: true,
    message: "directory was copied!",
  };
}

function search_messages(messages: any[], search_query: string): message[] {
  const options = {
    keys: ["combined_keys"],
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.35,
    distance: search_query.length + 20,
  };
  let item_results: message[] = [];
  if (search_query !== "") {
    const fuse = new Fuse(messages, options);
    let results = fuse.search(search_query);
    for (let i = 0; i < results.length; i++) {
      let message_item = results[i].item;
      item_results.push({
        comserver: message_item.comserver,
        description: message_item.description,
        scripts: message_item.scripts,
        raw_message: message_item.raw_message,
        notes: message_item.notes,
        directory_path: message_item.directory_path,
        type: message_item.type,
        id: message_item.id,
      });
    }
  } else {
    for (let i = 0; i < messages.length; i++) {
      let message_item = messages[i];
      item_results.push({
        comserver: message_item.comserver,
        description: message_item.description,
        scripts: message_item.scripts,
        raw_message: message_item.raw_message,
        notes: message_item.notes,
        directory_path: message_item.directory_path,
        type: message_item.type,
        id: message_item.id,
      });
    }
  }
  return item_results;
}

function replacer(key, value) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

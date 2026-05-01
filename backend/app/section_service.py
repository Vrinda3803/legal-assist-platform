from .kb_loader import load_json_file


def find_section_detail(act: str, section: str):
    act_upper = act.upper().strip()
    section = str(section).strip()

    if act_upper == "IPC":
        records = load_json_file("ipc.json")
    elif act_upper == "CRPC":
        records = load_json_file("crpc.json")
    else:
        return None

    for record in records:
        record_section = str(
            record.get("Section")
            or record.get("section")
            or record.get("section_number")
            or ""
        ).strip()

        if record_section == section:
            return {
                "act": act_upper,
                "section": record_section,
                "section_title": (
                    record.get("section_title")
                    or record.get("title")
                    or "No title available"
                ),
                "description": (
                    record.get("section_desc")
                    or record.get("description")
                    or record.get("content")
                    or "No description available"
                ),
            }

    return None
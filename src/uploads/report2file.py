import argparse
import json


def load_and_process_errors(filePath):
    data = json.load(open(filePath))['results']

    errors_by_file = {}

    for detection in data['detectors']:
        for element in detection['elements']:
            file_name = element['source_mapping']['filename_relative']
            error_details = {
                'check': detection['check'],
                'description': detection['description'],
                'impact': detection['impact'],
                'confidence': detection['confidence'],
                'lines': element['source_mapping']['lines'],
                'start_col': element['source_mapping']['starting_column'],
                'end_col': element['source_mapping']['ending_column']
            }

            # Append error details to the file's list of errors
            if file_name not in errors_by_file:
                errors_by_file[file_name] = []
            errors_by_file[file_name].append(error_details)

    with open('result_file.json', 'w') as json_file:
        json.dump(errors_by_file, json_file, indent=4)
def main():
    parser = argparse.ArgumentParser(description='Process the JSON file to extract errors.')
    parser.add_argument('filePath', type=str, help='The file path of the JSON file to be processed.')

    args = parser.parse_args()

    load_and_process_errors(args.filePath)

if __name__ == "__main__":
    main()

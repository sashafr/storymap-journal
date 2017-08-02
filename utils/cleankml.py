import xml.etree.ElementTree as ET
import sys, getopt
import re

def main(argv):
    inputfile = ''
    outputfile = 'output.kml'
    commands = []
    
    try:
        opts, args = getopt.getopt(argv, "di:o:")
    except getopt.GetoptError:
        print('Please use a valid argument:')
        print('    -d               To clean the <description> tag of all but url and date')
        print('    -i <inputfile>   To provide an input file [required]')
        print('    -o <outputfile>  To provide an output file, if not given, defaults to output.kml')
        sys.exit(2)
    
    for opt, arg in opts:
        if opt == '-d':
            commands.append('-d')
        elif opt == '-i':
            inputfile = arg
        elif opt == '-o':
            outputfile = arg
            
    for command in commands:
        if command == '-d':
            if inputfile == '':
                print('Error: You must provide an input file')
                print('    -d               To clean the <description> tag of all but url and date. Requires -i argument.')
                print('    -i <inputfile>   To provide an input file [required]')
                print('    -o <outputfile>  To provide an output file, if not given, defaults to output.kml')
            else:
                try: 
                    tree = ET.parse(inputfile)
                    root = tree.getroot()
                    
                    # this namespace check should allow it to work even if it doesn't have one
                    ns = ''
                    match = re.match('\{.*\}', root.tag)
                    if match:
                        ns += match.group(0)

                    # the expected location of the date is in Document/Folder/Placemark/description (case sensitive)
                    for placemark in root.findall(ns + 'Document/Folder/Placemark'):
                        description = placemark.find('description')
                        if description is not None:
                            desc_html = description.text
                            new_desc = '<![CDATA['
                            # date capture Date.*?</b>.*?</td>.*?<td>(.*?)</td>.*?</tr> - this only takes the year (or last four digits inside element)
                            # image capture <img.*?src=['"](.*?)['"]
                            date_match = re.search('Date.*?</b>.*?</td>.*?<td>.*([0-9]{4})[^0-9]*?</td>.*?</tr>', desc_html)
                            image_match = re.search(r'<img.*?src=[\'\"](.*?)[\'\"]', desc_html)
                            if image_match:
                                new_desc += '<img>' + image_match.group(1) + '</img>'
                            if date_match:
                                new_desc += 'date>' + date_match.group(1) + '</date>'
                             
                            # if no date or image is found, this will just blank description
                            description.text = new_desc + ']]>'
                    
                    tree.write(outputfile)
                                
                except ET.ParseError as err:
                    print('You must provide a valid kml file')
                    print(err)
                    sys.exit(2)
    
if __name__ == "__main__":
    main(sys.argv[1:])

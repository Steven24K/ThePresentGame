import os


avatars = os.listdir('static/img/avatars')

file = open('src/utils/avatars.ts', 'w')


file.write("""// Generated by prepare-avatars.py DO NOT EDIT THIS FILE

export type Avatar = {
    src: string
}

""")


file.write("export const Avatars: Avatar[] = [ \n")

for i in avatars:
    print('Add image {}'.format(i))
    file.write("{src:'images/avatars/" + i + "'},\n") 

file.write("]")

file.close()

print('Done...')
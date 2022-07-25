# %%
import json
import os

# %%
def to_Emotion(energy, valence):
    """
    Convert energy & valence to emotion
    """
    if energy > 0.5:
        emotion = "Happy" if valence > 0.5 else "Angry"
    else:
        emotion = "Relaxed" if valence > 0.5 else "Sad"

    return emotion

def file_emotion_classfier(dir_path):
    file_dir = os.listdir(dir_path)

    print("Total file : ", len(file_dir))

    for file in file_dir:
        file_path = dir_path + '/' + file

        with open(file_path) as f:
            file_json = json.load(f)
            emotion = to_Emotion(file_json['audio_features']['valence'],
                                 file_json['audio_features']['energy'])

            save_path = 'processed_emotion/' + emotion + '/' + file
            with open(save_path, 'w') as out_f:
                json.dump(file_json, out_f)


# %%
if __name__ == "__main__":
    path = 'processed'
    file_emotion_classfier(path)

# %%
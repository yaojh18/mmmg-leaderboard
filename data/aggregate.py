import os
import json

agg_json = []
models = os.listdir('./')
for model in models:
    if os.path.isdir('./' + model):
        model_info = {}
        metadata = json.load(open('./' + model + '/metadata.json', 'r'))
        model_info['info'] = metadata
        for category in ('i', 'it', 'a', 'at'):
            if os.path.exists('./' + model + '/' + category + '_agg_eval.json'):
                category_agg_eval = json.load(open('./' + model + '/' + category + '_agg_eval.json', 'r'))
                model_info[category] = category_agg_eval
            else:
                model_info[category] = None
        agg_json.append(model_info)
json.dump(agg_json, open('./data.json', 'w'), indent=4)

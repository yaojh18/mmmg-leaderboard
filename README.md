## Submit to Leaderboard
1. Run the MMMG [evaluation pipeline](https://github.com/yaojh18/MMMG).
2. Create a new folder under the `./data`. Put all the evaluation results `x_agg_eval.json`, where `x` is `i`, `it`, `a`, `at` under the new folder, depending on your evaluated category. You can find the this json file under `./ouput/{your model name}/`. Also, you need crete a `metadata.json` file under the `./data/{your folder}/` to give the basic information of your model, which include the following keys:
   + "name": your model's name
   + "type": can take "open_source", "proprietary" or "agent"
   + "date": your model's release date, optional
   + "size": your model's size, optional
   + "link": your model's link, optional 
3. Create a pull request, and we will validate your uploaded data.
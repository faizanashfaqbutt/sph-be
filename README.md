
# Smart Product Hunting


## How to run node js server


create a new .env file and copy the content from env.example or just rename the .env.example file to .env

```bash
  yarn install
  yarn run dev
```


## How to run python server


assuming you already have python installed
First open terminal from project directort and go to ai folder
```bash
  cd ai
```
Create and activate a virtual envirnoment
```bash
  python3 -m venv venv
  cd venv\Scripts
  activate
  cd ../../
```
or
```bash
  python3 -m venv venv
  path\to\venv\Scripts\activate.bat
```
After creating and activating virtual envirnoment
We ll install required libraries/packages from requirment.txt file
```bash
pip3 install -r requirements.txt
```
Once all packages/libraries are installed 
run the server using the command below

```bash
python3 pyserver.py
```
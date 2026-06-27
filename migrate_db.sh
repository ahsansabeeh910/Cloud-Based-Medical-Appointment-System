#!/bin/bash
set -e
echo "Backing up from Atlas..."
mongodump --uri="mongodb+srv://ahsansabeeh910_db_user:c3QohyiOGV13CFoh@cluster0.qfsl8ny.mongodb.net/medical-appointment" --out="$HOME/mongo_backup"

echo "Restoring to new EC2 DB Server..."
mongorestore --host=172.31.39.24 --port=27017 "$HOME/mongo_backup/"

echo "Migration Complete!"

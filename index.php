<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>HomePi</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <div class="status-box">
            <span id="status"></span></br>
            <span id="update"></span>
        </div>
        <div class="circle-box">
            <div id="circle" class="circle"></div>
        </div>
        <button id="wakeBtn" class="btn">Wake Computer</button>
        <div class="operateBtns">
            <button id="restartBtn" class="btn" disabled>Restart OS</button>
            <button id="shutdownBtn" class="btn" disabled>Shutdown OS</button>
            <button id="switchBtn" class="btn" disabled>Switch OS</button>
        </div>
    </div>
</body>
<script src="js/script.js"></script>
</html>


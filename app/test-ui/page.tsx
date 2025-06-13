export default function TestUIPage() {
  return (
    <html>
      <head>
        <title>Test Page</title>
        <style>{`
          body {
            margin: 0;
            padding: 20px;
            font-family: system-ui, -apple-system, sans-serif;
            background: white;
            color: black;
          }
          .test-box {
            padding: 20px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 8px;
          }
          .blue { background: #e3f2fd; }
          .red { background: #ffebee; }
          .green { background: #e8f5e8; }
          .btn {
            padding: 10px 20px;
            margin: 5px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            color: white;
          }
          .btn-blue { background: #2196f3; }
          .btn-green { background: #4caf50; }
          .btn-red { background: #f44336; }
        `}</style>
      </head>
      <body>
        <h1>極シンプル テストページ</h1>
        
        <div>
          <h2>基本テスト</h2>
          <div className="test-box blue">
            <p>青い背景のテストボックス</p>
          </div>
          <div className="test-box red">
            <p>赤い背景のテストボックス</p>
          </div>
          <div className="test-box green">
            <p>緑の背景のテストボックス</p>
          </div>
        </div>

        <div>
          <h2>基本ボタン</h2>
          <button className="btn btn-blue">Blue Button</button>
          <button className="btn btn-green">Green Button</button>
          <button className="btn btn-red">Red Button</button>
        </div>

        <div>
          <h2>リンク</h2>
          <a href="/" style={{color: 'blue', textDecoration: 'underline'}}>ホームへ</a>
          <br />
          <a href="/surveys" style={{color: 'blue', textDecoration: 'underline'}}>アンケート一覧へ</a>
        </div>
      </body>
    </html>
  )
}
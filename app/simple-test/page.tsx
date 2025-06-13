export default function SimpleTestPage() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'system-ui', 
      background: 'white', 
      color: 'black',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'red', fontSize: '32px' }}>
        シンプルテストページ
      </h1>
      
      <div style={{ 
        padding: '20px', 
        background: '#f0f0f0', 
        margin: '20px 0',
        borderRadius: '8px'
      }}>
        <p>このページが表示されれば、基本的なレンダリングは動作しています。</p>
      </div>

      <div style={{ 
        padding: '20px', 
        background: '#e3f2fd', 
        margin: '20px 0',
        borderRadius: '8px'
      }}>
        <p>青い背景のボックス</p>
      </div>

      <button style={{
        padding: '10px 20px',
        background: '#2196f3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        テストボタン
      </button>

      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
          ホームに戻る
        </a>
      </div>
    </div>
  )
}